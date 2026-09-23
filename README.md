# THE WALL.

> Everybody has a story, nobody has to know whose 👀

An anonymous corner of the internet. No usernames, no profiles, no followers. Just thoughts.

This is **Stage 1: a frontend prototype**. There's no backend, database or accounts yet. Posts, comments and reactions are saved in your browser (`localStorage`), so nobody else can see them.

## Run it

Open `index.html` in a browser. No build step or install is needed.

To use a local server instead:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Landing page: the concept, how it works, a sample thought you can shuffle through |
| `feed.html` | The wall: filters, featured thoughts, reactions, random discovery |
| `post.html?id=…` | A single thought with all six reactions and anonymous comments |
| `create.html` | "Say it." Write, pick a type, preview, then post anonymously |

## Structure

```
css/style.css        design tokens, components, animations (mobile first)
css/responsive.css   breakpoints
js/data.js           sample posts used to seed the wall on first visit
js/app.js            local store, anonymous numbers, moderation checks, helpers
js/interactions.js   shared post card rendering + reaction handling
js/home.js           landing page
js/feed.js           feed layout and filters
js/post.js           single thought + comments
js/create.js         posting flow
```

## Colours

| Name | Hex |
| --- | --- |
| Violet | `#9355FF` |
| Obsidian | `#0B0B0F` |
| Blue | `#011A43` |
| Ivory | `#F7F4EE` |

## Good to know

- Every post and comment gets a random 4-digit number that belongs only to it. Numbers aren't linked to each other or to a person.
- Moderation (personal info, links, handles, a few banned phrases) is basic and runs in the browser only. Stage 2 must repeat these checks on the server.
- "Reset the wall" in the footer clears your local data and restores the sample posts.
