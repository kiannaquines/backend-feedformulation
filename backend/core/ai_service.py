import os
import json
from typing import List, Dict, Any

# ── Groq (primary AI — ultra-fast inference) ──────────────────────────────────
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY is not set. Falling back to Gemini or rule-based logic.")

# ── Google Gemini (fallback AI) ───────────────────────────────────────────────
try:
    import google.generativeai as genai
    GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
    if GOOGLE_API_KEY:
        genai.configure(api_key=GOOGLE_API_KEY)
    _gemini_available = bool(GOOGLE_API_KEY)
except ImportError:
    _gemini_available = False

GROQ_MODEL   = "llama-3.3-70b-versatile"   # fastest & most capable on Groq
GEMINI_MODEL = "gemini-1.5-flash"


def _call_groq(prompt: str, system: str = "") -> str:
    """
    Call the Groq API and return the raw text response.
    Raises an exception if the call fails.
    """
    client = Groq(api_key=GROQ_API_KEY)
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.3,
        max_tokens=512,
    )
    return response.choices[0].message.content.strip()


def _call_gemini(prompt: str) -> str:
    """Gemini fallback — returns raw text or raises."""
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)
    return response.text.strip()


def _call_ai(prompt: str, system: str = "") -> str:
    """
    Try Groq first; fall back to Gemini; raise if both fail.
    """
    if GROQ_API_KEY:
        try:
            return _call_groq(prompt, system)
        except Exception as e:
            print(f"Groq call failed ({e}), trying Gemini fallback.")

    if _gemini_available:
        try:
            full_prompt = f"{system}\n\n{prompt}" if system else prompt
            return _call_gemini(full_prompt)
        except Exception as e:
            print(f"Gemini call also failed: {e}")

    raise RuntimeError("Both Groq and Gemini are unavailable.")


# ─────────────────────────────────────────────────────────────────────────────
# AIIngredientSuggester
# ─────────────────────────────────────────────────────────────────────────────

class AIIngredientSuggester:
    """
    AI-based ingredient suggestion system for feed formulation.
    Uses Groq (primary) → Gemini (fallback) → rule-based scoring.
    """

    def __init__(self):
        self.weights = {
            'protein_match':    0.30,
            'energy_match':     0.30,
            'calcium_match':    0.15,
            'phosphorus_match': 0.15,
            'cost_efficiency':  0.10,
        }
        self.use_ai = bool(GROQ_API_KEY or _gemini_available)

    # ── Scoring helpers ───────────────────────────────────────────────────────

    def calculate_nutrient_score(self, ingredient_value: float, required_value: float, tolerance: float = 0.3) -> float:
        """Score 0–100: how well an ingredient's nutrient matches the requirement."""
        if required_value == 0:
            return 50
        diff = abs(ingredient_value - required_value) / required_value
        if diff <= tolerance:
            return 100 - (diff / tolerance) * 30
        elif diff <= 1.0:
            return 70 - (diff - tolerance) / (1.0 - tolerance) * 40
        else:
            return max(0, 30 - (diff - 1.0) * 10)

    def calculate_cost_efficiency_score(self, ingredient: Dict, all_ingredients: List[Dict]) -> float:
        """Score based on nutritional value per unit cost relative to the group average."""
        if not all_ingredients or ingredient['price'] == 0:
            return 50

        def density(ing):
            return (
                ing['crude_protein'] * 2 +
                ing['metabolized_energy'] * 1.5 +
                ing['calcium'] * 10 +
                ing['total_phosphorus'] * 10
            ) / (ing['price'] + 0.01)

        d      = density(ingredient)
        avg_d  = sum(density(i) for i in all_ingredients) / len(all_ingredients)

        if d >= avg_d * 1.5: return 100
        if d >= avg_d * 1.2: return 85
        if d >= avg_d:       return 70
        if d >= avg_d * 0.8: return 55
        return 40

    # ── Reason generation ─────────────────────────────────────────────────────

    def generate_suggestion_reasons(self, ingredient: Dict, requirements: Dict, scores: Dict) -> List[str]:
        """Return up to 3 short reasons why this ingredient is recommended."""
        if self.use_ai:
            try:
                system = "You are an expert in animal nutrition and feed formulation."
                prompt = f"""Analyze this ingredient and explain why it is a good match for the given requirements.

Ingredient: {ingredient['name']}
- Protein: {ingredient['crude_protein']:.1f}%
- Energy (ME): {ingredient['metabolized_energy']:.2f}
- Calcium: {ingredient['calcium']:.2f}%
- Phosphorus: {ingredient['total_phosphorus']:.2f}%
- Price: ${ingredient['price']:.2f}/kg

Requirements:
- Protein: {requirements['protein_percent']:.1f}%
- Energy: {requirements['energy_me']:.2f} ME
- Calcium: {requirements['calcium_percent']:.2f}%
- Phosphorus: {requirements['phosphorus_percent']:.2f}%

Match Scores:
- Protein: {scores['protein']:.0f}%  Energy: {scores['energy']:.0f}%
- Calcium: {scores['calcium']:.0f}%  Phosphorus: {scores['phosphorus']:.0f}%
- Cost efficiency: {scores['cost_efficiency']:.0f}%

Provide exactly 3 short, compelling reasons (max 8 words each) why this ingredient is recommended.
Return ONLY a valid JSON array of strings — no markdown, no explanation.
Example: ["High protein content", "Cost-effective option", "Excellent calcium source"]"""

                raw = _call_ai(prompt, system)
                # Strip markdown code fences if present
                raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
                reasons = json.loads(raw)
                if isinstance(reasons, list) and reasons:
                    return reasons[:3]
            except Exception as e:
                print(f"AI reason generation failed, using rule-based: {e}")

        # Rule-based fallback
        reasons = []
        if scores['protein'] >= 80:
            reasons.append(
                f"Excellent protein source ({ingredient['crude_protein']:.1f}%)"
                if ingredient['crude_protein'] >= requirements['protein_percent'] * 1.5
                else f"Good protein match ({ingredient['crude_protein']:.1f}%)"
            )
        if scores['energy'] >= 80:
            reasons.append(
                f"High energy content ({ingredient['metabolized_energy']:.2f} ME)"
                if ingredient['metabolized_energy'] >= requirements['energy_me'] * 1.2
                else f"Good energy match ({ingredient['metabolized_energy']:.2f} ME)"
            )
        if requirements['calcium_percent'] > 0 and scores['calcium'] >= 75:
            reasons.append(f"Rich in calcium ({ingredient['calcium']:.2f}%)")
        if requirements['phosphorus_percent'] > 0 and scores['phosphorus'] >= 75:
            reasons.append(f"Good phosphorus content ({ingredient['total_phosphorus']:.2f}%)")
        if scores['cost_efficiency'] >= 80:
            reasons.append("Excellent cost-efficiency")
        elif scores['cost_efficiency'] >= 70:
            reasons.append("Cost-effective")
        avg = sum(scores[k] for k in ('protein','energy','calcium','phosphorus')) / 4
        if avg >= 70 and len(reasons) < 2:
            reasons.append("Well-balanced nutrition")
        if not reasons:
            reasons.append("Suitable nutritional profile")
        return reasons[:3]

    # ── AI insights ───────────────────────────────────────────────────────────

    def _generate_ai_insights(self, top_suggestions: List[Dict], requirements: Dict) -> List[str]:
        """One-line strategic insight per top suggestion."""
        try:
            summary = "\n".join([
                f"{i+1}. {s['ingredient_name']} (Match: {s['match_score']:.0f}%) — "
                f"Protein: {s['nutritional_info']['protein']:.1f}%, "
                f"Energy: {s['nutritional_info']['energy']:.2f} ME, "
                f"Cost: ${s['nutritional_info']['price']:.2f}/kg"
                for i, s in enumerate(top_suggestions[:3])
            ])
            system = "You are an expert animal nutritionist."
            prompt = f"""Based on these top ingredient recommendations:

{summary}

Target requirements:
- Protein: {requirements['protein_percent']:.1f}%
- Energy: {requirements['energy_me']:.2f} ME
- Calcium: {requirements['calcium_percent']:.2f}%
- Phosphorus: {requirements['phosphorus_percent']:.2f}%

For each ingredient, provide one concise insight (max 12 words) about its strategic value or usage tip.
Return ONLY a valid JSON array of strings — no markdown, no explanation.
Example: ["Ideal base ingredient for protein foundation", "Balances energy without excessive cost", "Complements minerals effectively"]"""

            raw = _call_ai(prompt, system)
            raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            insights = json.loads(raw)
            if isinstance(insights, list):
                return insights
        except Exception as e:
            print(f"AI insights generation failed: {e}")
        return []

    # ── Main suggest method ───────────────────────────────────────────────────

    def suggest_ingredients(
        self,
        available_ingredients: List[Dict],
        requirements: Dict,
        excluded_names: List[str] = None,
        top_n: int = 5
    ) -> List[Dict]:
        if excluded_names is None:
            excluded_names = []
        excluded_lower = [n.lower() for n in excluded_names]

        candidates = [
            ing for ing in available_ingredients
            if ing['name'].lower() not in excluded_lower and ing.get('is_available', True)
        ]
        if not candidates:
            return []

        suggestions = []
        for ingredient in candidates:
            p_score  = self.calculate_nutrient_score(ingredient['crude_protein'],    requirements.get('protein_percent', 0))
            e_score  = self.calculate_nutrient_score(ingredient['metabolized_energy'],requirements.get('energy_me', 0))
            ca_score = self.calculate_nutrient_score(ingredient['calcium'],          requirements.get('calcium_percent', 0))
            ph_score = self.calculate_nutrient_score(ingredient['total_phosphorus'], requirements.get('phosphorus_percent', 0))
            c_score  = self.calculate_cost_efficiency_score(ingredient, available_ingredients)

            total = (
                p_score  * self.weights['protein_match'] +
                e_score  * self.weights['energy_match'] +
                ca_score * self.weights['calcium_match'] +
                ph_score * self.weights['phosphorus_match'] +
                c_score  * self.weights['cost_efficiency']
            )

            scores = {'protein': p_score, 'energy': e_score, 'calcium': ca_score,
                      'phosphorus': ph_score, 'cost_efficiency': c_score}

            suggestions.append({
                'ingredient_id':   ingredient['id'],
                'ingredient_name': ingredient['name'],
                'match_score':     round(total, 1),
                'reasons':         self.generate_suggestion_reasons(ingredient, requirements, scores),
                'nutritional_info': {
                    'protein':    ingredient['crude_protein'],
                    'energy':     ingredient['metabolized_energy'],
                    'calcium':    ingredient['calcium'],
                    'phosphorus': ingredient['total_phosphorus'],
                    'price':      ingredient['price'],
                },
                'detailed_scores': {
                    'protein_match':    round(p_score, 1),
                    'energy_match':     round(e_score, 1),
                    'calcium_match':    round(ca_score, 1),
                    'phosphorus_match': round(ph_score, 1),
                    'cost_efficiency':  round(c_score, 1),
                }
            })

        suggestions.sort(key=lambda x: x['match_score'], reverse=True)

        if self.use_ai and suggestions:
            try:
                insights = self._generate_ai_insights(suggestions[:top_n], requirements)
                for i, s in enumerate(suggestions[:top_n]):
                    if i < len(insights):
                        s['ai_insight'] = insights[i]
            except Exception as e:
                print(f"AI insights failed: {e}")

        return suggestions[:top_n]


# ─────────────────────────────────────────────────────────────────────────────
# AIFeedAssistant  (chat)
# ─────────────────────────────────────────────────────────────────────────────

class AIFeedAssistant:
    """
    AI-powered chat assistant for feed formulation.
    Uses Groq (primary) → Gemini (fallback) → canned error message.
    """

    def __init__(self):
        self.use_ai = bool(GROQ_API_KEY or _gemini_available)
        self.conversation_history: List[Dict] = []

    def chat(self, user_message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if not self.use_ai:
            return {
                "response": "AI assistant is currently unavailable. Please use manual ingredient selection.",
                "action": None
            }

        try:
            req_text = (
                f"Current Nutrient Requirements:\n"
                f"- Protein: {context.get('protein_percent', 0):.1f}%\n"
                f"- Energy: {context.get('energy_me', 0):.2f} ME\n"
                f"- Calcium: {context.get('calcium_percent', 0):.2f}%\n"
                f"- Phosphorus: {context.get('phosphorus_percent', 0):.2f}%"
            )

            sel_text = ""
            if context.get('selected_ingredients'):
                sel_text = "\n\nCurrently Selected Ingredients:\n" + "\n".join(
                    f"- {i['name']}: {i.get('percentage', 0)*100:.1f}%"
                    for i in context['selected_ingredients']
                )

            avail_text = ""
            if context.get('available_ingredients'):
                avail_text = "\n\nAvailable Ingredients Database:\n" + "\n".join(
                    f"- {i['name']}: Protein {i['crude_protein']:.1f}%, "
                    f"Energy {i['metabolized_energy']:.2f} ME, ${i['price']:.2f}/kg"
                    for i in context['available_ingredients'][:20]
                )

            system = (
                "You are an expert animal nutritionist and feed formulation assistant. "
                "Help users create optimal feed formulations through natural conversation. "
                "Always respond in valid JSON — no markdown, no extra text."
            )

            prompt = f"""{req_text}{sel_text}{avail_text}

User: {user_message}

Instructions:
1. Analyze the user's request.
2. If they want to add an ingredient, identify it from the available ingredients list.
3. Provide helpful, concise advice.
4. Be conversational and supportive.

Respond ONLY with a valid JSON object — no markdown, no code fences:
{{
    "response": "Your conversational reply (max 100 words)",
    "action": "add_ingredient" or null,
    "ingredient_name": "exact ingredient name from available list" or null,
    "reasoning": "Brief explanation" or null
}}"""

            raw  = _call_ai(prompt, system)
            raw  = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            result = json.loads(raw)

            self.conversation_history.append({
                "user": user_message,
                "assistant": result.get("response", "")
            })
            return result

        except Exception as e:
            print(f"Chat processing error: {e}")
            return {
                "response": (
                    "I'm having trouble understanding that request. "
                    "Could you rephrase it, or use manual ingredient selection?"
                ),
                "action": None
            }

    def reset_conversation(self):
        self.conversation_history = []


# ─────────────────────────────────────────────────────────────────────────────
# AI status / health check
# ─────────────────────────────────────────────────────────────────────────────

def test_gemini_connection() -> Dict[str, Any]:
    """
    Test the active AI backend connection (Groq preferred, Gemini fallback).
    Endpoint name kept for backward compatibility.
    """
    # Try Groq first
    if GROQ_API_KEY:
        try:
            text = _call_groq("Reply with exactly: API test successful")
            return {
                "status":        "success",
                "message":       "Groq AI is working correctly",
                "api_available": True,
                "model_name":    GROQ_MODEL,
                "provider":      "groq",
                "test_response": text,
            }
        except Exception as e:
            print(f"Groq status test failed: {e}")

    # Try Gemini fallback
    if _gemini_available:
        try:
            text = _call_gemini("Say 'API test successful' if you can read this.")
            return {
                "status":        "success",
                "message":       "Gemini AI is working (Groq key missing)",
                "api_available": True,
                "model_name":    GEMINI_MODEL,
                "provider":      "gemini",
                "test_response": text,
            }
        except Exception as e:
            return {
                "status":        "error",
                "message":       f"Gemini connection failed: {e}",
                "api_available": False,
                "model_name":    None,
                "provider":      None,
                "test_response": None,
            }

    return {
        "status":        "error",
        "message":       "No AI API key configured. Set GROQ_API_KEY in your .env file.",
        "api_available": False,
        "model_name":    None,
        "provider":      None,
        "test_response": None,
    }


# Global instances
ai_suggester   = AIIngredientSuggester()
ai_assistant   = AIFeedAssistant()
