import os
import json
from typing import List, Dict, Any
import google.generativeai as genai

# Configure Google AI
GOOGLE_API_KEY = "AIzaSyBgBGohW84u5Uct4hO7lzzQEqfrMfyNHLs"
genai.configure(api_key=GOOGLE_API_KEY)

# AI-based ingredient suggestion service with Google Gemini integration

class AIIngredientSuggester:
    """
    AI-based ingredient suggestion system for feed formulation.
    Uses intelligent scoring algorithms to recommend optimal ingredients.
    """
    
    def __init__(self):
        self.weights = {
            'protein_match': 0.30,
            'energy_match': 0.30,
            'calcium_match': 0.15,
            'phosphorus_match': 0.15,
            'cost_efficiency': 0.10
        }
        
        # Initialize Gemini model
        try:
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.use_ai = True
        except Exception as e:
            print(f"Warning: Could not initialize Gemini AI: {e}")
            self.use_ai = False
    
    def calculate_nutrient_score(self, ingredient_value: float, required_value: float, tolerance: float = 0.3) -> float:
        """
        Calculate how well an ingredient's nutrient matches the requirement.
        Returns a score between 0 and 100.
        """
        if required_value == 0:
            return 50  # Neutral score if no requirement
        
        # Calculate percentage difference
        diff_percentage = abs(ingredient_value - required_value) / required_value
        
        # Score based on how close it is to the requirement
        if diff_percentage <= tolerance:
            # Excellent match - within tolerance
            score = 100 - (diff_percentage / tolerance) * 30
        elif diff_percentage <= 1.0:
            # Good match - within 100% difference
            score = 70 - (diff_percentage - tolerance) / (1.0 - tolerance) * 40
        else:
            # Poor match
            score = max(0, 30 - (diff_percentage - 1.0) * 10)
        
        return max(0, min(100, score))
    
    def calculate_cost_efficiency_score(self, ingredient: Dict, all_ingredients: List[Dict]) -> float:
        """Calculate cost efficiency score based on nutritional value per cost."""
        if not all_ingredients or ingredient['price'] == 0:
            return 50
        
        # Calculate nutritional density (nutrients per unit cost)
        nutrient_value = (
            ingredient['crude_protein'] * 2 +  # Protein is valuable
            ingredient['metabolized_energy'] * 1.5 +
            ingredient['calcium'] * 10 +
            ingredient['total_phosphorus'] * 10
        )
        
        density = nutrient_value / (ingredient['price'] + 0.01)  # Avoid division by zero
        
        # Compare with average
        avg_density = sum(
            (ing['crude_protein'] * 2 + ing['metabolized_energy'] * 1.5 + 
             ing['calcium'] * 10 + ing['total_phosphorus'] * 10) / (ing['price'] + 0.01)
            for ing in all_ingredients
        ) / len(all_ingredients)
        
        # Score relative to average
        if density >= avg_density * 1.5:
            return 100
        elif density >= avg_density * 1.2:
            return 85
        elif density >= avg_density:
            return 70
        elif density >= avg_density * 0.8:
            return 55
        else:
            return 40
    
    def generate_suggestion_reasons(self, ingredient: Dict, requirements: Dict, scores: Dict) -> List[str]:
        """Generate human-readable reasons for the suggestion using AI."""
        reasons = []
        
        # Try to use Gemini AI for intelligent reasoning
        if self.use_ai:
            try:
                prompt = f"""You are an expert in animal nutrition and feed formulation. Analyze this ingredient and explain why it's a good match for the requirements.

Ingredient: {ingredient['name']}
- Protein: {ingredient['crude_protein']:.1f}%
- Energy (ME): {ingredient['metabolized_energy']:.2f}
- Calcium: {ingredient['calcium']:.2f}%
- Phosphorus: {ingredient['total_phosphorus']:.2f}%
- Price: ${ingredient['price']:.2f}/kg

Requirements:
- Protein needed: {requirements['protein_percent']:.1f}%
- Energy needed: {requirements['energy_me']:.2f} ME
- Calcium needed: {requirements['calcium_percent']:.2f}%
- Phosphorus needed: {requirements['phosphorus_percent']:.2f}%

Matching Scores:
- Protein match: {scores['protein']:.0f}%
- Energy match: {scores['energy']:.0f}%
- Calcium match: {scores['calcium']:.0f}%
- Phosphorus match: {scores['phosphorus']:.0f}%
- Cost efficiency: {scores['cost_efficiency']:.0f}%

Provide exactly 3 short, compelling reasons (max 8 words each) why this ingredient is recommended. Focus on the strongest benefits. Return only the reasons as a JSON array of strings.

Example format: ["High protein content", "Cost-effective option", "Excellent calcium source"]"""

                response = self.model.generate_content(prompt)
                ai_reasons = json.loads(response.text.strip())
                
                if isinstance(ai_reasons, list) and len(ai_reasons) > 0:
                    return ai_reasons[:3]
            except Exception as e:
                print(f"AI reasoning failed, using fallback: {e}")
        
        # Fallback to rule-based reasoning
        # Protein reasons
        if scores['protein'] >= 80:
            if ingredient['crude_protein'] >= requirements['protein_percent'] * 1.5:
                reasons.append(f"Excellent protein source ({ingredient['crude_protein']:.1f}%)")
            else:
                reasons.append(f"Good protein match ({ingredient['crude_protein']:.1f}%)")
        
        # Energy reasons
        if scores['energy'] >= 80:
            if ingredient['metabolized_energy'] >= requirements['energy_me'] * 1.2:
                reasons.append(f"High energy content ({ingredient['metabolized_energy']:.2f} ME)")
            else:
                reasons.append(f"Good energy match ({ingredient['metabolized_energy']:.2f} ME)")
        
        # Mineral reasons
        if requirements['calcium_percent'] > 0 and scores['calcium'] >= 75:
            reasons.append(f"Rich in calcium ({ingredient['calcium']:.2f}%)")
        
        if requirements['phosphorus_percent'] > 0 and scores['phosphorus'] >= 75:
            reasons.append(f"Good phosphorus content ({ingredient['total_phosphorus']:.2f}%)")
        
        # Cost reasons
        if scores['cost_efficiency'] >= 80:
            reasons.append("Excellent cost-efficiency")
        elif scores['cost_efficiency'] >= 70:
            reasons.append("Cost-effective")
        
        # Balanced nutrition
        avg_score = (scores['protein'] + scores['energy'] + scores['calcium'] + scores['phosphorus']) / 4
        if avg_score >= 70 and len(reasons) < 2:
            reasons.append("Well-balanced nutrition")
        
        # Ensure at least one reason
        if not reasons:
            reasons.append("Suitable nutritional profile")
        
        return reasons[:3]  # Limit to top 3 reasons
    
    def suggest_ingredients(
        self,
        available_ingredients: List[Dict],
        requirements: Dict,
        excluded_names: List[str] = None,
        top_n: int = 5
    ) -> List[Dict]:
        """
        Generate AI-based ingredient suggestions.
        
        Args:
            available_ingredients: List of ingredient dictionaries
            requirements: Dictionary with nutrient requirements
            excluded_names: List of ingredient names to exclude
            top_n: Number of top suggestions to return
        
        Returns:
            List of suggestion dictionaries with scores and reasons
        """
        if excluded_names is None:
            excluded_names = []
        
        excluded_lower = [name.lower() for name in excluded_names]
        
        # Filter ingredients
        candidates = [
            ing for ing in available_ingredients
            if ing['name'].lower() not in excluded_lower and ing.get('is_available', True)
        ]
        
        if not candidates:
            return []
        
        suggestions = []
        
        for ingredient in candidates:
            # Calculate individual scores
            protein_score = self.calculate_nutrient_score(
                ingredient['crude_protein'],
                requirements.get('protein_percent', 0)
            )
            
            energy_score = self.calculate_nutrient_score(
                ingredient['metabolized_energy'],
                requirements.get('energy_me', 0)
            )
            
            calcium_score = self.calculate_nutrient_score(
                ingredient['calcium'],
                requirements.get('calcium_percent', 0)
            )
            
            phosphorus_score = self.calculate_nutrient_score(
                ingredient['total_phosphorus'],
                requirements.get('phosphorus_percent', 0)
            )
            
            cost_score = self.calculate_cost_efficiency_score(ingredient, available_ingredients)
            
            # Weighted total score
            total_score = (
                protein_score * self.weights['protein_match'] +
                energy_score * self.weights['energy_match'] +
                calcium_score * self.weights['calcium_match'] +
                phosphorus_score * self.weights['phosphorus_match'] +
                cost_score * self.weights['cost_efficiency']
            )
            
            scores = {
                'protein': protein_score,
                'energy': energy_score,
                'calcium': calcium_score,
                'phosphorus': phosphorus_score,
                'cost_efficiency': cost_score
            }
            
            reasons = self.generate_suggestion_reasons(ingredient, requirements, scores)
            
            suggestions.append({
                'ingredient_id': ingredient['id'],
                'ingredient_name': ingredient['name'],
                'match_score': round(total_score, 1),
                'reasons': reasons,
                'nutritional_info': {
                    'protein': ingredient['crude_protein'],
                    'energy': ingredient['metabolized_energy'],
                    'calcium': ingredient['calcium'],
                    'phosphorus': ingredient['total_phosphorus'],
                    'price': ingredient['price']
                },
                'detailed_scores': {
                    'protein_match': round(protein_score, 1),
                    'energy_match': round(energy_score, 1),
                    'calcium_match': round(calcium_score, 1),
                    'phosphorus_match': round(phosphorus_score, 1),
                    'cost_efficiency': round(cost_score, 1)
                }
            })
        
        # Sort by total score and return top N
        suggestions.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Add AI-generated insights for top suggestions
        if self.use_ai and suggestions:
            try:
                insights = self._generate_ai_insights(suggestions[:top_n], requirements)
                if insights:
                    for i, suggestion in enumerate(suggestions[:top_n]):
                        if i < len(insights):
                            suggestion['ai_insight'] = insights[i]
            except Exception as e:
                print(f"AI insights generation failed: {e}")
        
        return suggestions[:top_n]
    
    def _generate_ai_insights(self, top_suggestions: List[Dict], requirements: Dict) -> List[str]:
        """Generate AI-powered insights about the top suggestions."""
        try:
            ingredients_summary = "\n".join([
                f"{i+1}. {s['ingredient_name']} (Match: {s['match_score']:.0f}%) - "
                f"Protein: {s['nutritional_info']['protein']:.1f}%, "
                f"Energy: {s['nutritional_info']['energy']:.2f} ME, "
                f"Cost: ${s['nutritional_info']['price']:.2f}/kg"
                for i, s in enumerate(top_suggestions[:3])
            ])
            
            prompt = f"""You are an expert animal nutritionist. Based on these top ingredient recommendations:

{ingredients_summary}

Target requirements:
- Protein: {requirements['protein_percent']:.1f}%
- Energy: {requirements['energy_me']:.2f} ME
- Calcium: {requirements['calcium_percent']:.2f}%
- Phosphorus: {requirements['phosphorus_percent']:.2f}%

For each ingredient, provide one concise insight (max 12 words) about its strategic value or usage tip.
Return as a JSON array of strings, one per ingredient.

Example: ["Ideal base ingredient for protein foundation", "Balances energy without excessive cost", "Complements minerals effectively"]"""

            response = self.model.generate_content(prompt)
            insights = json.loads(response.text.strip())
            
            if isinstance(insights, list):
                return insights
        except Exception as e:
            print(f"Error generating AI insights: {e}")
        
        return []


class AIFeedAssistant:
    """
    AI-powered chat assistant for feed formulation.
    Helps users through natural language conversation.
    """
    
    def __init__(self):
        try:
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.use_ai = True
        except Exception as e:
            print(f"Warning: Could not initialize Gemini AI for chat: {e}")
            self.use_ai = False
        
        self.conversation_history = []
    
    def chat(self, user_message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process user message and return AI response with actions.
        
        Args:
            user_message: User's natural language input
            context: Current formulation context (ingredients, requirements, etc.)
        
        Returns:
            Dictionary with response text and actions to perform
        """
        if not self.use_ai:
            return {
                "response": "AI assistant is currently unavailable. Please use manual ingredient selection.",
                "action": None
            }
        
        try:
            # Build context for AI
            requirements_text = f"""
Current Nutrient Requirements:
- Protein: {context.get('protein_percent', 0):.1f}%
- Energy: {context.get('energy_me', 0):.2f} ME
- Calcium: {context.get('calcium_percent', 0):.2f}%
- Phosphorus: {context.get('phosphorus_percent', 0):.2f}%
"""
            
            selected_ingredients_text = ""
            if context.get('selected_ingredients'):
                selected_ingredients_text = "\n\nCurrently Selected Ingredients:\n" + "\n".join([
                    f"- {ing['name']}: {ing.get('percentage', 0)*100:.1f}%"
                    for ing in context['selected_ingredients']
                ])
            
            available_ingredients_text = ""
            if context.get('available_ingredients'):
                available_ingredients_text = "\n\nAvailable Ingredients Database:\n" + "\n".join([
                    f"- {ing['name']}: Protein {ing['crude_protein']:.1f}%, Energy {ing['metabolized_energy']:.2f} ME, ${ing['price']:.2f}/kg"
                    for ing in context['available_ingredients'][:20]  # Limit to top 20
                ])
            
            # Create prompt
            prompt = f"""You are an expert animal nutritionist and feed formulation assistant. Help users create optimal feed formulations through natural conversation.

{requirements_text}{selected_ingredients_text}{available_ingredients_text}

User: {user_message}

Instructions:
1. Analyze the user's request
2. If they want to add an ingredient, identify which one from the available ingredients
3. Provide helpful advice about the ingredient or formulation
4. Be conversational and supportive

Respond in JSON format with these fields:
{{
    "response": "Your conversational response to the user (max 100 words)",
    "action": "add_ingredient" or null,
    "ingredient_name": "exact ingredient name from available list" or null,
    "reasoning": "Brief explanation why this ingredient is good" or null
}}

If the user mentions an ingredient that doesn't exist in the available list, suggest the closest match or ask for clarification.
If the user asks a general question, provide helpful nutritional advice without an action."""

            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            
            # Store conversation
            self.conversation_history.append({
                "user": user_message,
                "assistant": result.get("response", "")
            })
            
            return result
            
        except Exception as e:
            print(f"Chat processing error: {e}")
            return {
                "response": "I'm having trouble understanding that request. Could you try rephrasing it or use the manual ingredient selection?",
                "action": None
            }
    
    def reset_conversation(self):
        """Clear conversation history."""
        self.conversation_history = []


def test_gemini_connection() -> Dict[str, Any]:
    """
    Test the Gemini API connection and return status.
    
    Returns:
        dict: Status information about the AI service
    """
    try:
        # Try to initialize model and make a simple test call
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Send a simple test prompt
        response = model.generate_content("Say 'API test successful' if you can read this.")
        
        return {
            "status": "success",
            "message": "Gemini AI is working correctly",
            "api_available": True,
            "model_name": "gemini-1.5-flash",
            "test_response": response.text
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini AI connection failed: {str(e)}",
            "api_available": False,
            "model_name": None,
            "test_response": None
        }


# Global instances
ai_suggester = AIIngredientSuggester()
ai_assistant = AIFeedAssistant()
