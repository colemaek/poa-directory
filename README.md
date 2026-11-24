# Poa directory

An opt-in list of [Poas](https://github.com/gearnoodle/poa-template). If you add your Poa here, every Poa reader that searches **Everywhere** can find it, even if nobody in their network reads you yet.

It matters most for Poas that aren't on GitHub Pages (Codeberg Pages, your own host, a custom domain), because readers can't find those any other way. GitHub Poas are welcome too.

The list is [`poas.md`](poas.md). Anyone can propose a change; a maintainer merges it.

## Add your Poa

1. Open [`poas.md`](poas.md) and click the pencil (✎) to edit it. GitHub makes a copy for you if you need one.
2. Add a line at the bottom of the list with your Poa's address:

   ```markdown
   - yourname.codeberg.page/poa
   ```

3. Click **Commit changes…**, then **Propose changes**, then **Create pull request**.

An automatic check then opens your Poa and reports any problem on the pull request. Once it passes, a maintainer merges it, and readers pick you up the next time they search.

**Your address** is the folder that holds your `poa.md`, without `https://` and without `/poa.md`, for example `marta.github.io/poa` or `example.com/poa`.

**Before you add it,** make sure that:

- it's your own Poa (or you have its owner's OK);
- `https://<your address>/poa.md` opens, over HTTPS, and starts with a header that has `version: 1`;
- your host lets other sites read your files (the `Access-Control-Allow-Origin: *` header). GitHub Pages does this on its own. On Codeberg Pages keep the template's `_headers` file, and on your own host use the `.htaccess` lines from the template's welcome post. Without it, web readers can't show your Poa;
- your `poa.md` doesn't say `search: no`. That line asks readers to keep you out of search, which is the opposite of being listed here.

## Remove your Poa

Delete your line from `poas.md` the same way and propose the change. If you can't, open an issue and a maintainer will remove it. Removing `index.html`'s discovery lines or adding `search: no` to your `poa.md` also keeps you out of search results, whether you're listed here or not.

Poas that stay offline for a long time may be removed by a maintainer. Readers already skip any Poa they can't reach, so nothing breaks in the meantime.

## The format

For anyone writing a reader or a crawler:

- The list lives at `https://raw.githubusercontent.com/gearnoodle/poa-directory/main/poas.md`. raw.githubusercontent.com allows cross-site requests, so a web page can fetch it.
- Every Markdown list item (`- `, `* ` or `+ `) is one Poa. Everything else in the file is ignored.
- An item is either a bare address (`- marta.github.io/poa`) or a link to one (`- [Marta](https://marta.github.io/poa)`). Text after the address is ignored.
- Addresses are read the same way as in "Poas I read": add `https://` if missing, and add `/poa.md` unless the address already ends in `.md`.
- A listing doesn't promise the Poa is online or still a Poa. Readers check `poa.md` themselves, skip Poas with `search: no`, and keep no copies.

## Run your own

Nothing about this list is special. Copy the repository, and point a reader at your copy by changing `DIRECTORY` at the top of the script in its `index.html`.

## For maintainers

- `.github/workflows/check.yml` runs `scripts/check-poas.mjs` on every pull request that changes `poas.md`. It checks the list's format and duplicates, and opens each **new** address: `poa.md` must answer over HTTPS, have a `version`, and not say `search: no`. A missing `Access-Control-Allow-Origin: *` header is a warning, since such a Poa works for crawlers but not web readers.
- Run the workflow by hand (**Actions → Check poas.md → Run workflow**) to check every address in the list.
- The check needs no secrets and runs with read-only permissions, so pull requests from forks are safe to check.
