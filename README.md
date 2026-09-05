# Expense tracker — front end

Angular 20 client for the `ExpenseTrackerBack` API, built to the approved mockups.

## Running it

The API must be running first — the client is useless without it.

```bash
cd ../ExpenseTrackerBack/ExpenseTracker.Api
dotnet run
```

That listens on `http://localhost:5159` and already allows `http://localhost:4200` via CORS.

```bash
npm start
```

Then open `http://localhost:4200`. Create an account, add a category or two, set a budget for the
month, and start logging.

The API base URL lives in `src/environments/environment.ts` (dev) and
`environment.production.ts` (build), swapped by `fileReplacements` in `angular.json`.

## Screens

| Route                      | What it does                                                              |
| -------------------------- | ------------------------------------------------------------------------- |
| `/account/sign-in`         | Sign in                                                                   |
| `/account/create-account`  | Register                                                                  |
| `/overview`                | Month summary, budget meter, category split, recent expenses              |
| `/expenses`                | Full ledger for the month, category filter, paging, edit and delete       |
| `/categories`              | Category CRUD                                                             |
| `/budgets`                 | Monthly allowances, with the carry-over the API calculates                |

## How it is put together

```
src/app/
  core/          models, HTTP services, interceptors, guards, shared utilities
  shared/        design-system components (modal, confirm, toasts, expense form) and pipes
  layout/shell/  the signed-in frame: sidebar nav and router outlet
  features/      one lazy-loaded module per screen
```

- **Auth** — the JWT and user details are held in a signal and mirrored to `localStorage`.
  `authInterceptor` attaches the bearer token; `errorInterceptor` unwraps the API's
  `ProblemDetails` into a plain message and signs the user out on a 401.
- **Rendering** — every route is client-rendered (`app.routes.server.ts`), because the whole app
  sits behind a token the browser holds. The SSR build still produces the shell.
- **Month state** — `MonthStateService` holds the year and month the app is looking at, so the
  overview, the ledger and the add-expense form agree on which budget is in play.
- **Category colours** — the API has no colour field, so `categoryColor()` hashes the category id
  into the mockup palette. Colours are stable per category and consistent across screens.

## Two things worth knowing about the API contract

- An expense can only be filed against a month that already **has a budget**. The overview shows an
  inline "set an allowance" panel for a month without one, and the add-expense form surfaces the
  API's error if the chosen date lands in an unbudgeted month.
- `Expense` has a single text field (`note`, 250 chars). The mockup's separate *Description* and
  *Note* inputs are therefore one field, labelled **Description**.

## Checks

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```
