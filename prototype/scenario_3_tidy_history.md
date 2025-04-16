# Scenario 3: Cleaning Up Messy History ✨

**Focus:** Demonstrating `Git 狀態掃描器`, `語意理解引擎`, `指令推理模組` (interactive rebase), `風險預測與說明`, `視覺化 Git Tree + 指令預測`.

**Goal:** Guide a user through using interactive rebase (`rebase -i`) to combine ("squash") several small, related commits into one meaningful commit before sharing.

---

## 1. User's Situation & Query

The user has been working on a feature branch (`feature/button-styling`) and has made several small commits like "fix typo", "add padding", "try color", "finalize color". They want to clean this up before merging.

**User Input (Chatbot):** 🗣️ "My branch has like 4 small commits for the button styling. Can I combine them into just one commit before I make a pull request?"

---

## 2. AI Agent Analysis & Interaction

**Step 2.1: Git Status Scan & History Review**
*   The Agent runs `git log --oneline -n 5` (or similar) on the current branch (`feature/button-styling`).
*   **Snapshot:**
    ```
    f4b3d2a (HEAD -> feature/button-styling) finalize color
    a1c8e5b try color
    9e8d7f6 add padding
    b2a9c3d fix typo
    c3d4e5f (origin/main, main) Add base layout
    ```
*   The Agent also checks if the branch has been pushed (`git branch -r --contains f4b3d2a`). Assume it hasn't been pushed yet.

**Step 2.2: Semantic Understanding & Command Recommendation**
*   The Agent understands the user wants to combine the last 4 commits.
*   **Agent Output:** 🤖
    > Yes, absolutely! Combining ("squashing") those small commits into one makes the history cleaner and easier to understand. The best tool for this is **interactive rebase** (`git rebase -i`).
    >
    > It looks like you have 4 commits on top of `main` related to button styling:
    > ```
    > f4b3d2a finalize color
    > a1c8e5b try color
    > 9e8d7f6 add padding
    > b2a9c3d fix typo
    > ```
    > We can combine these into a single, well-described commit.
    >
    > **Here's the command:**
    > ```bash
    > # Rebase interactively, starting from *before* the first commit you want to change.
    > # Here, we want to change the last 4 commits, so we go back 4 from HEAD.
    > git rebase -i HEAD~4
    > ```
    > *   `rebase -i`: Starts an *interactive* rebase.
    > *   `HEAD~4`: Specifies how far back to go. `HEAD~4` means "the commit 4 steps before `HEAD`" (which is commit `c3d4e5f` in this case). The rebase will operate on the 4 commits *after* that one.
    >
    > **⚠️ Safety Warning:** Rebase **rewrites history**. Like `amend`, this is safe if you haven't pushed the branch yet. If you have, let me know, as it requires more care (force-pushing).

---

## 3. Interactive Rebase Guidance

**Step 3.1: Explaining the Interactive Editor**
*   **Agent Output:** 🤖
    > When you run `git rebase -i HEAD~4`, Git will open your default text editor with a file that looks something like this:
    > ```text
    > pick b2a9c3d fix typo
    > pick 9e8d7f6 add padding
    > pick a1c8e5b try color
    > pick f4b3d2a finalize color
    >
    > # Rebase c3d4e5f..f4b3d2a onto c3d4e5f (4 commands)
    > #
    > # Commands:
    > # p, pick <commit> = use commit
    > # r, reword <commit> = use commit, but edit the commit message
    > # e, edit <commit> = use commit, but stop for amending
    > # s, squash <commit> = use commit, but meld into previous commit
    > # f, fixup <commit> = like "squash", but discard this commit's log message
    > # x, exec <command> = run command (the rest of the line) using shell
    > # b, break = stop here (continue rebase later with 'git rebase --continue')
    > # d, drop <commit> = remove commit
    > # l, label <label> = label current HEAD with a name
    > # t, reset <label> = reset HEAD to a label
    > # m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
    > # .       create a merge commit using the original merge commit's
    > #         message (or the oneline, if no original merge commit was
    > #         specified). Use -c <commit> to reword the commit message.
    > #
    > # These lines can be re-ordered; they are executed from top to bottom.
    > ```
    > *   The lines starting with `pick` are the commits you're rebasing, listed **oldest first**. 
    > *   To combine them, you'll change `pick` to `squash` (or `s`) for the commits you want to merge *into the one above them*.

**Step 3.2: Simulating the Edit**
*   **Agent Output:** 🤖
    > To squash all 4 commits into the first one ("fix typo") and give it a new message, you would edit the file like this:
    > ```text
    > pick b2a9c3d fix typo  # Keep this one
    > s 9e8d7f6 add padding   # Squash this into the one above
    > s a1c8e5b try color     # Squash this into the one above
    > s f4b3d2a finalize color # Squash this into the one above
    > 
    > # ... (rest of the comments) ...
    > ```
    > *   Keep the *first* commit as `pick`.
    > *   Change `pick` to `s` (or `squash`) for all the commits you want to merge *up* into the previous one.
    >
    > **After you save and close this file:** Git will then open *another* editor window allowing you to write the *new* commit message for the combined commit. Delete the old messages and write a single, clear message like "Style feature button".

**Step 3.3: Visual Prediction**
*   **Agent Output:** 🤖
    > **Here's what the history will look like *before* and *after* the rebase:**
    > 
    > **Before:**
    > ```mermaid
    > gitGraph
    >    commit id: "C"
    >    commit id: "T" msg: "fix typo"
    >    commit id: "P" msg: "add padding"
    >    commit id: "TC" msg: "try color"
    >    commit id: "F" msg: "finalize color" type: HIGHLIGHT
    >    branch feature/button-styling
    > ```
    > 
    > **After `rebase -i HEAD~4` with squashing:**
    > ```mermaid
    > gitGraph
    >    commit id: "C"
    >    commit id: "S" msg: "Style feature button" type: HIGHLIGHT
    >    branch feature/button-styling
    > ```
    > > *(Agent renders graphs)*
    > See how the four commits (`T`, `P`, `TC`, `F`) are replaced by a single new commit (`S`) with a new hash and message?
    >
    > Would you like to proceed with `git rebase -i HEAD~4`? I can't perform the interactive edits for you, but I can launch the command.
    >
    > `[Run git rebase -i HEAD~4]` `[Explain 'fixup']` `[Cancel]`

---

## 4. Post-Rebase Check

*   After the user completes the interactive rebase process in their editor.
*   **Agent (detects history change):** 🤖
    > Okay, the rebase seems to be complete! Let's check the log:
    > ```
    > $ git log --oneline -n 3
    > e7g8h9i (HEAD -> feature/button-styling) Style feature button
    > c3d4e5f (origin/main, main) Add base layout
    > ...
    > ```
    > Looks much cleaner! The four previous commits are now combined into `e7g8h9i`. Your branch is ready to be reviewed or merged. 👍 