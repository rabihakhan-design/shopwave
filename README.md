# ShopWave – React + DummyJSON store

```
npm install
npm run dev
```
Open the URL Vite prints (http://localhost:5173). Requires internet (uses https://dummyjson.com).

Demo login: `emilys` / `emilyspass` (the Login page also lists more users fetched from `/users`).

## API endpoints used (DummyJSON docs)
| Feature | Endpoint |
| --- | --- |
| Products, pagination, sort | `GET /products?limit&skip&sortBy&order` |
| Search | `GET /products/search?q=` |
| Categories | `GET /products/categories`, `GET /products/category/:slug` |
| Product details, related | `GET /products/:id` |
| Login / session | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh` |
| Demo users | `GET /users?select=...` |
| Orders | `GET /carts/user/:id`, `POST /carts/add` |

## JSONPlaceholder endpoints used (https://jsonplaceholder.typicode.com)
| Feature | Endpoint |
| --- | --- |
| Blog list (search, author filter) | `GET /posts`, `GET /users` |
| Blog post, author | `GET /posts/:id`, `GET /users/:id` |
| Comments of a post | `GET /posts/:id/comments` |
| Add a comment | `POST /comments` |
| Contact form | `POST /posts` |

JSONPlaceholder fakes all writes (nothing is stored), so new comments only show on the page until you leave it.

## Improvements in this version
- Search and category now work together (DummyJSON cannot do this, so matches are fetched with `limit=0` and filtered here).
- Expired login tokens are refreshed with `/auth/refresh`; if that fails the user is logged out cleanly.
- DummyJSON does not save new carts, so placed orders are also kept on this device and shown in the Profile.
- GET responses are cached for 60 seconds (fewer repeated requests).
- Product page: related products, page title, "Back to products" on 404, unique image keys.
