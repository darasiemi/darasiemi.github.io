# Repository guide for coding agents

## What this repository is

This is Oluwadara Adedeji's personal academic website, hosted as the root GitHub Pages site at `https://darasiemi.github.io`. It is a customized [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme. Jekyll turns Markdown, Liquid templates, Sass, data files, bibliography data, and static assets into the generated `_site/` directory.

The repository still contains upstream al-folio documentation and sample/fallback data. Treat `_config.yml` and the current content as the authority for this site rather than assuming every example in the upstream README is active.

## Architecture and important paths

- `_config.yml` is the central site configuration. It controls identity, URLs, navigation/features, collections, archives, Jekyll Scholar, responsive image generation, analytics, and third-party library versions. The site is a user site: `url` is `https://darasiemi.github.io` and `baseurl` must remain blank.
- `_pages/` contains standalone pages. The folder is explicitly included by Jekyll; navigation is driven by front matter such as `nav` and `nav_order`.
- `_posts/` contains dated blog posts. Use Jekyll's `YYYY-MM-DD-slug.md` naming convention and `layout: post`; existing posts use `date`, `description`, `tags`, and `categories` front matter.
- `_news/` and `_projects/` are configured Jekyll collections. News entries use dated front matter and appear on the home page. Projects use `layout: page`, `description`, `img`, `importance`, and `category`.
- `_layouts/` defines complete Liquid page layouts. `_includes/` contains reusable components, including the header/footer, publication rendering, CV sections, media helpers, repository cards, and feature-specific script loaders.
- `_sass/` contains theme partials. `assets/css/main.scss` is the Jekyll/Sass entry point and imports them; theme tokens are primarily in `_sass/_variables.scss` and `_sass/_themes.scss`.
- `assets/js/` contains browser-side behavior. The site uses plain JavaScript and jQuery rather than a bundled application framework. Many third-party libraries are selected conditionally by `_includes/head.liquid` and the script includes.
- `assets/` also holds images, generated responsive image variants, fonts, PDFs, JSON Resume data, notebooks, audio/video, and other static files. `assets/json/resume.json` is the active CV source; `_data/cv.yml` is fallback/sample data.
- `_bibliography/papers.bib` drives the publications page through Jekyll Scholar. `_data/coauthors.yml` enriches matching authors, `_data/repositories.yml` controls GitHub cards, and `_data/venues.yml` styles venue abbreviations.
- `_plugins/` contains custom Ruby extensions for cache busting, details tags, local third-party downloads, external RSS posts, file checks, Google Scholar citation counts, BibTeX filtering, and accent removal. Changes here affect build-time behavior and may involve network access.
- `Gemfile`/`Gemfile.lock` define the Ruby/Jekyll stack. `package.json`/`package-lock.json` contain only the pinned Prettier tooling. `requirements.txt` records `nbconvert` for notebook support. ImageMagick is required because responsive images are enabled.
- `.github/workflows/` is the source of truth for CI and deployment. `_site/`, `.jekyll-cache/`, Sass caches, `node_modules/`, `vendor/`, and generated `assets/libs/` are build artifacts and must not be hand-edited or committed.

## Setup and local development

Docker is the documented and preferred development path because it supplies Ruby, Jekyll, ImageMagick, Jupyter tooling, and live reload:

```bash
docker compose pull
docker compose up
```

Open `http://localhost:8080`. The repository is mounted into the container, and `bin/entry_point.sh` serves with watch, live reload, tracing, and polling. To build the image locally instead of using the prebuilt image, run `docker compose up --build`. The optional smaller image is started with `docker compose -f docker-compose-slim.yml up`.

VS Code Development Containers are also supported by `.devcontainer/devcontainer.json`; attaching starts `bin/entry_point.sh` automatically.

For a native setup, use Ruby 3.2.2 to match GitHub Actions and Bundler 2.5.10 to match `Gemfile.lock`. Do not rewrite the lockfile merely to support macOS's old system Ruby. Install ImageMagick plus Python/Jupyter dependencies, then install the locked Ruby and Node dependencies:

```bash
bundle install
python3 -m pip install -r requirements.txt
npm ci
bundle exec jekyll serve
```

The native server is at `http://localhost:4000`. Native setup is labeled legacy/unsupported in `INSTALL.md`; use Docker when practical.

## Validation

There is no unit-test suite. A production site build is the primary functional check:

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

`bin/cibuild` is a shorthand for `bundle exec jekyll build`. Successful builds write `_site/`. If validating responsive image changes, make sure ImageMagick is available. Some plugin-backed features (external feeds, Google Scholar citations, or locally downloaded third-party libraries when enabled) can require network access.

Formatting is a required CI gate. The project pins Prettier 3.1.1 and `@shopify/prettier-plugin-liquid` 1.4.0, uses a 150-column width, and allows ES5 trailing commas:

```bash
npm ci
npx prettier . --check                  # or: make format_check
npx prettier . --write                  # or: make format
```

Prefer checking or formatting only touched files while working; a repository-wide write can alter unrelated content. Honor `.prettierignore`, especially for minified/vendor files, maps, generated Lighthouse reports, and `assets/css/main.scss`.

Optional pre-commit hooks check trailing whitespace, final newlines, YAML syntax, and newly added large files:

```bash
pre-commit run --all-files
```

GitHub Actions additionally runs Lychee against repository links and, after deployment, local links in the generated site. Axe accessibility testing is manual. For higher-risk template/navigation changes, preview the relevant pages at desktop and mobile widths and check both light and dark themes. The full deployment build also installs Jupyter, builds with `JEKYLL_ENV=production`, and runs `purgecss -c purgecss.config.js`; PurgeCSS rewrites generated CSS under `_site/` only.

## Editing conventions

- Preserve YAML front matter delimiters and follow nearby content for field shape. Tags/categories may be a scalar or YAML list, but lists are preferred when adding multiple values.
- Keep page URLs base-path safe. In Liquid, prefer `relative_url`, `absolute_url`, or `site.baseurl` patterns already used by adjacent templates instead of hard-coded root URLs.
- Reuse existing layouts and includes before duplicating markup. Feature scripts and styles are generally enabled conditionally from page front matter or `_config.yml`.
- Use two-space indentation in YAML, Liquid/HTML, JavaScript, JSON, and SCSS, as enforced by Prettier. Follow existing Ruby style in `_plugins/` when touching legacy code, but keep new code clear and idiomatic.
- Put visual styling in Sass partials and import it through `assets/css/main.scss`. Reuse CSS custom properties such as `--global-text-color`, `--global-bg-color`, and `--global-theme-color` so light/dark mode remains correct.
- Keep JavaScript compatible with the existing direct-script model; there is no transpilation or bundling step. Check that DOM-dependent behavior works with both the relevant page and optional feature flags.
- Store ordinary images in `assets/img/` and reference them using existing helper/include conventions. Do not edit generated width-prefixed WebP variants directly. Keep downloadable publication documents in `assets/pdf/`.
- Publication additions belong in `_bibliography/papers.bib`; use the custom fields supported by `_layouts/bib.liquid` (for example `selected`, `preview`, `pdf`, `doi`, `code`, `website`, and `bibtex_show`). Keep author matching consistent with the `scholar` names in `_config.yml`.
- Avoid editing copied/minified third-party assets unless the task is explicitly an upstream asset upgrade. Third-party CDN versions and integrity hashes are centralized under `third_party_libraries` in `_config.yml`.
- Never edit `_site/` as source. Do not commit caches, dependencies, generated libraries, or local environment files. Preserve lockfiles unless intentionally changing dependencies.
- Keep changes scoped and do not replace personalized content/configuration with al-folio demo values. The fallback `_data/cv.yml` and `_pages/about_einstein.md` are examples, not the live profile.

## CI and deployment notes

Pushes and pull requests to `master`/`main` trigger Prettier and relevant build/link workflows. `.github/workflows/deploy.yml` uses Ruby 3.2.2, installs ImageMagick and Jupyter, performs a production Jekyll build, purges unused CSS, and publishes `_site/` to the GitHub Pages deployment branch. Documentation-only paths are excluded from deployment triggers.

Do not run `bin/deploy` casually. It is a legacy, destructive branch-deployment script: it requires a clean worktree, creates/replaces `gh-pages`, deletes source files on that branch, and can force-push. Normal deployment is handled by GitHub Actions. Likewise, leave generated `gh-pages` content alone.

Before handing off a change, report which of the following were run and any environment limitation:

1. Prettier check for all touched supported files.
2. `JEKYLL_ENV=production bundle exec jekyll build` (or the equivalent Docker build).
3. Relevant browser checks for layout, navigation, responsive behavior, accessibility, and light/dark theme.
4. Link checks when URLs or navigation changed.
