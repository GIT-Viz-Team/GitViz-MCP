# Scenario 1: Oops! Accidental Commit 😨

**Focus:** Demonstrating `Git 狀態掃描器`, `語意理解引擎`, `指令推理模組`, `風險預測與說明`, `模擬執行 / 確認互動`.

**Goal:** Guide a beginner user to safely undo a commit that included incorrect or unwanted files/changes.

---

## 1. User's Situation & Query

The user has just made a commit but realizes they included a temporary debug file (`debug.log`) and forgot to save a change in `main.py`.

**User Input (Chatbot):** 🗣️ "Oh no, I just committed, but I included `debug.log` by mistake and I forgot to save my latest change in `main.py`! How do I fix this?"

---

## 2. AI Agent Analysis & Interaction

**Step 2.1: Git Status Scan**
*   The Agent runs `git status`, `git log -1 --name-only`, and `git show HEAD` in the background.
*   **Snapshot:**
    *   Working directory is clean (but `main.py` has unstaged changes from before the commit).
    *   Last commit (`HEAD`, hash `abc1234`) includes `main.py` and `debug.log`.

**Step 2.2: Semantic Understanding & Intent Recognition**
*   The Agent understands the user wants to:
    1.  Remove `debug.log` from the last commit.
    2.  Add the *correct* version of `main.py` to the last commit.
    3.  Essentially, *amend* the previous commit.

**Step 2.3: Command Recommendation & Explanation**
*   **Agent Output:** 🤖
    > Okay, I see you just committed (`abc1234`) including `debug.log` and an older version of `main.py`. Don't worry, we can fix this! Here are a few ways:
    >
    > **Option 1: Amend the last commit (Recommended for simple fixes)**
    > This lets you add/remove files and change the commit message of your *very last* commit. It's like getting a second chance before sharing your work.
    >
    > ```bash
    > # 1. First, remove the wrong file from the staging area
    > git rm --cached debug.log
    >
    > # 2. Then, add the correct version of main.py
    > git add main.py
    >
    > # 3. Now, amend the previous commit
    > git commit --amend --no-edit
    > ```
    > *   `rm --cached`: Removes the file *only* from Git's tracking for the next commit, keeps the actual file.
    > *   `add main.py`: Stages the *current* version of `main.py`.
    > *   `commit --amend`: Replaces the last commit with a new one containing the currently staged changes.
    > *   `--no-edit`: Keeps the original commit message. We can change it if you like!
    >
    > **Option 2: Reset and Re-commit (More control, slightly more steps)**
    > This undoes the last commit but keeps your changes, letting you re-build the commit carefully.
    >
    > ```bash
    > # 1. Undo the last commit, keep all changes in your working files
    > git reset --soft HEAD~1
    >
    > # 2. Now your files (main.py, debug.log) are staged again.
    > #    Unstage the unwanted file:
    > git restore --staged debug.log
    >
    > # 3. Ensure main.py has the correct content saved.
    > #    Then stage it (if it wasn't already):
    > git add main.py
    >
    > # 4. Create the correct commit:
    > git commit -m "Your original commit message"
    > ```
    > *   `reset --soft HEAD~1`: Moves the `HEAD` pointer back one commit, putting the changes from the undone commit back into the staging area. Your working files are untouched.
    > *   `restore --staged`: Unstages a file, keeping its changes in your working directory.
    >
    > **⚠️ Safety Warning:** Both options **rewrite history**. If you've already pushed this commit and someone else might have pulled it, amending/resetting can cause problems for them. Let me know if you've already pushed!

---

## 3. Simulation & Confirmation

**Step 3.1: Command Simulation (Visual)**
*   The Agent shows a simplified view of what happens with Option 1 (`amend`):

    ```
    Before:
    ... -> B (Commit def5678) -> C (Commit abc1234) [HEAD -> main]
                                   │
                                   ├── main.py (old version)
                                   └── debug.log

    After 'git commit --amend':
    ... -> B (Commit def5678) -> C' (Commit xyz9876) [HEAD -> main]
                                    │
                                    └── main.py (CORRECT version)
    ```
    > **Agent:** Notice how the commit hash changes from `abc1234` to `xyz9876`? That's because `amend` creates a *new* commit replacing the old one. The `debug.log` is no longer part of the commit history.

**Step 3.2: User Confirmation**
*   **Agent Output:** 🤖
    > Option 1 (`--amend`) seems like the most direct way here. Would you like me to execute those commands for you?
    >
    > `[Execute Option 1]` `[Choose Option 2]` `[Do Nothing]`

---

## 4. Execution (If Confirmed)

*   If the user confirms, the Agent executes the chosen command sequence.
*   It then runs `git status` and `git log -1 --name-only` again to show the result.

**Agent Output:** 🤖
> Okay, I've amended the last commit.
> ```
> $ git status
> On branch main
> nothing to commit, working tree clean
>
> $ git log -1 --name-only
> commit xyz9876... (HEAD -> main)
> Author: ...
> Date:   ...
>
>     Your original commit message
>
> main.py
> ```
> Looks like `debug.log` is gone from the commit and `main.py` is updated. All set! 👍 