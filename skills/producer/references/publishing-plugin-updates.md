# Publishing plugin updates to GitHub

Every change to Reel Studio (a skill, a reference, a kit file, a script) is a plugin update, and **every plugin update is pushed to GitHub**: https://github.com/Atheeb00158U/claude-reel-studio (branch `main`).

## Where the repo lives
- Source of truth: the git repo in **Claude video work/claude-reel-studio** on the Mac (remote `origin` = the GitHub URL above).
- Commit author: `Atheeb <Atheeb00158U@users.noreply.github.com>`. Never commit with the work email.

## Steps (each update)
1. **Get the repo into the cloud.** On the Mac VM: `tar -czf "_Global library/plugins/repo-in.tgz" -C "Claude video work" claude-reel-studio` (run from `$HOME/mnt`), stage it, extract into a fresh cloud folder.
2. **Edit** the files. Bump `version` in `.claude-plugin/plugin.json` (patch = wording/fixes, minor = new rules, tools or kit components) and add a short `## vX.Y.Z` section to README.md saying what changed and why (in Atheeb's words where the change came from his feedback).
3. **Commit and tag** in the cloud:
   ```sh
   git -c user.name=Atheeb -c user.email=Atheeb00158U@users.noreply.github.com \
     commit -am "Reel Studio vX.Y.Z: <one-line summary>"
   git tag vX.Y.Z
   ```
   (`git add` new files first.) Check `git log -1 --format='%h %ae'` shows the noreply email.
4. **Package** the plugin: zip the folder without `.git` as `reel-studio.plugin` and deliver it with SendUserFile so Atheeb can reinstall it.
5. **Send the repo back.** Tar the whole repo including `.git` as `claude-reel-studio-vX.Y.Z.tgz`, commit it to `_Global library/plugins/` on the Mac, extract it into a **fresh** folder, then swap folders: `mv -n claude-reel-studio "_to_delete/claude-reel-studio-<old version>"` and `mv -n <fresh>/claude-reel-studio claude-reel-studio`. Never extract over the old repo: git object files are read-only and the VM can't delete, so the copy fails half-way.
6. **Push.**
   - If the cloud has a working GitHub login (`gh auth status` passes), push from the cloud: `git push origin main --tags`.
   - Otherwise give Atheeb the one line to run in Terminal on the Mac:
     `cd ~/Desktop/"Claude video work"/claude-reel-studio && git push origin main --tags`
   - If deletion is allowed in Claude video work for the session, git also runs directly on the Mac VM (steps 1–5 can be done in place), but the push still needs Atheeb's GitHub login.
7. **Confirm** the push: `git ls-remote --tags origin` shows the new tag (public repo), or check the repo page. Note the version and commit in the project doc `claude/plugin-publishing.md`.

## Never
- Commit secrets, tokens, `.env` files, client footage, renders or voice files.
- Commit third-party audio, footage or fonts whose licence forbids redistribution (Storyblocks, Mixkit, Pixabay, YouTube rips, meme audio, commercial fonts). Commit an index of them instead (see `sfx/` in the README).
- Force-push `main` without asking Atheeb.
