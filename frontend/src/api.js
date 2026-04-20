import axios from 'axios'

const BASE = '/api/v1'

const http = axios.create({ baseURL: BASE })

// Attach JWT token to every request
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Handle 401 globally — redirect to login
http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const API = {
  /* ── Auth ──────────────────────────────────────────── */
  auth: {
    login:    data => http.post('/auth/login', data),
    register: data => http.post('/auth/register', data),
  },

  /* ── Ingredients ───────────────────────────────────── */
  ingredients: {
    all:      ()       => http.get('/ingredients/all'),
    getById:  id       => http.get(`/ingredients/${id}`),
    create:   data     => http.post('/ingredients/create', data),
    update:   (id, d)  => http.put(`/ingredients/update/${id}`, d),
    delete:   id       => http.delete(`/ingredients/delete/${id}`),
    aiSuggest: data    => http.post('/ingredients/ai-suggest', data),
    aiChat:    data    => http.post('/ingredients/ai-chat', data),
    aiStatus:  ()      => http.get('/ingredients/ai-status'),
  },

  /* ── Nutrient Requirements ─────────────────────────── */
  nutrients: {
    all:    ()      => http.get('/nutrient-requirements/all'),
    create: data    => http.post('/nutrient-requirements/create', data),
    update: (id, d) => http.put(`/nutrient-requirements/update/${id}`, d),
    delete: id      => http.delete(`/nutrient-requirements/delete/${id}`),
  },

  /* ── Formulation ───────────────────────────────────── */
  formulation: {
    calculate:  data => http.post('/feed/formulate', data),
    save:       data => http.post('/feed/formulation/save', data),
    all:        ()   => http.get('/feed/formulation/all'),
    mine:       ()   => http.get('/my/feed/formulation/'),
    remove:     id   => http.delete(`/feed/formulation/remove/${id}`),
    update:     (id, d) => http.put(`/feed/formulation/update/${id}`, d),
  },
}

export default http
