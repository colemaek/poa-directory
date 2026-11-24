# Poa directory

An opt-in list of [Poas](https://github.com/gearnoodle/poa-template). If you add your Poa here, every Poa reader that searches **Everywhere** can find it, even if nobody in their network reads you yet.

It matters most for Poas that aren't on GitHub Pages (Codeberg Pages, your own host, a custom domain), because readers can't find those any other way. GitHub Poas are welcome too.

The list is [`poas.md`](poas.md). Anyone can propose a change; a maintainer merges it.

**Browse it at [gearnoodle.github.io/poa-directory](https://gearnoodle.github.io/poa-directory/).** The page opens every listed Poa live and shows its name, category and latest post, with category filters and a "random Poa" button. Poas that say `search: no` aren't shown, and Poas that don't answer are listed separately as unreachable. Nothing is copied or kept.

## Add your Poa

You need a free [GitHub account](https://github.com/signup). Sign in first, then:

1. **Open the list for editing:** [github.com/gearnoodle/poa-directory/edit/main/poas.md](https://github.com/gearnoodle/poa-directory/edit/main/poas.md).
2. **Fork the repository.** GitHub says *"You need to fork this repository to propose changes."* That's expected: click the green **Fork this repository** button. It makes your own copy of the list, which is how you suggest a change to someone else's repository. You can delete the copy once you're listed.
3. **Add your line.** The editor opens with the list. Go to the very end and add a new line with a dash, a space and your Poa's address:

   ```markdown
   - yourname.codeberg.page/poa
   ```

   Change nothing else in the file.
4. **Save it as a proposal.** Click the green **Commit changes…** button at the top right. A box opens; click **Propose changes** at the bottom of it.
5. **Send it.** A page titled *Comparing changes* opens. Click **Create pull request**, and on the next page click **Create pull request** again.

That's it. An automatic check then opens your Poa and shows the result on your pull request after a minute or two (the first time, it may wait for a maintainer to let it run). A green tick means all is well, and a maintainer will merge it. A red cross means something needs fixing: click **Details** to see what. Fix it on your Poa, then leave a comment on the pull request and a maintainer will run the check again.

Once merged, you show up on [the directory page](https://gearnoodle.github.io/poa-directory/), and Poa readers find you the next time they search "Everywhere".

**Your address** is the folder that holds your `poa.md`, without `https://` and without `/poa.md`, for example `marta.github.io/poa` or `example.com/poa`.

**Before you add it,** make sure that:

- it's your own Poa (or you have its owner's OK);
- `https://<your address>/poa.md` opens, over HTTPS, and starts with a header that has `version: 1`;
- your host lets other sites read your files (the `Access-Control-Allow-Origin: *` header). GitHub Pages does this on its own. On Codeberg Pages keep the template's `_headers` file, and on your own host use the `.htaccess` lines from the template's welcome post. Without it, web readers can't show your Poa;
- your `poa.md` doesn't say `search: no`. That line asks readers to keep you out of search, which is the opposite of being listed here.

## Remove your Poa

Delete your line from `poas.md` with the same steps (open the list for editing, remove your line, propose the change). If you can't, open an issue and a maintainer will remove it. Removing `index.html`'s discovery lines or adding `search: no` to your `poa.md` also keeps you out of search results, whether you're listed here or not.

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

- `index.html` is the browsing page, served by GitHub Pages from `main` (Settings → Pages → Deploy from a branch → `main`, `/ (root)`). `.nojekyll` keeps `poas.md` served as it is.

- `.github/workflows/check.yml` runs `scripts/check-poas.mjs` on every pull request that changes `poas.md`. It checks the list's format and duplicates, and opens each **new** address: `poa.md` must answer over HTTPS, have a `version`, and not say `search: no`. A missing `Access-Control-Allow-Origin: *` header is a warning, since such a Poa works for crawlers but not web readers.
- Run the workflow by hand (**Actions → Check poas.md → Run workflow**) to check every address in the list.
- The check needs no secrets and runs with read-only permissions, so pull requests from forks are safe to check. GitHub holds workflows from first-time contributors until a maintainer clicks **Approve and run** on the pull request, so look out for that.
- To re-run the check after someone fixes their Poa: on the pull request, **Checks → Re-run jobs**.
