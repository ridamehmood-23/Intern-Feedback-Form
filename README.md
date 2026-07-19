# Intern Feedback Form

A weekly check-in form for interns. Validates input on the client, submits
it to a mock REST API with `fetch()`, and shows clear loading, success, and
error states.

## How to run

No build step — plain HTML/CSS/JS.

1. Clone this repo.
2. Open `index.html` directly in a browser, **or** serve it locally:
```bash
   npx serve .
   # or
   python3 -m http.server 5500
```
3. Fill in the form and submit.

## API used

[JSONPlaceholder](https://jsonplaceholder.typicode.com/guide) (`POST /posts`
and `GET /posts?_limit=5`). Chosen because it's the recommended option for
this task — zero setup, no account needed, and it returns a realistic `201`
with a generated `id` on POST, which is what the success message needs to
show. It fakes saving rather than actually persisting data, so the "Recent
check-ins" list always shows JSONPlaceholder's same 5 seed posts instead of
real submissions — that's expected behavior for this API, not a bug.
MockAPI.io would be the option to switch to if real persistence were needed.

## Features

- Inline validation for every field (name, email, category, rating,
  message) — no `alert()` popups, errors shown next to the field.
- `POST` request with the required JSON body and `Content-Type` header.
- Submit button disables and shows a loading state while the request is
  in flight.
- Success state shows the returned `id` and resets the form.
- Error state (network failure or non-2xx) keeps the user's input so they
  can retry. `response.ok` is checked explicitly, since `fetch()` doesn't
  throw on 404/500.
- Bonus: character counter on the message field, live GET + render of the
  5 latest posts, responsive layout from 375px to 1280px+.

## Screenshots

**Validation errors:**
_(add screenshot)_

**Success state:**
_(add screenshot)_

## What I learned / what was hard

_(write your reflection here)_

## Live link

_(optional — add if deployed)_
