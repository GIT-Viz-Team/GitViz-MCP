# Scenario 2: Merge Conflict Mayhem 🤯

**Focus:** Demonstrating `Git 狀態掃描器`, `語意理解引擎` (detecting conflict state), `指令推理模組` (suggesting resolution steps), `視覺化 Git Tree`.

**Goal:** Help a beginner understand what a merge conflict is, identify the conflicting parts, and guide them through the resolution process.

---

## 1. User's Situation & Query

The user is working on a feature branch (`feature/new-login`) and tries to merge the latest changes from the `main` branch into their feature branch to keep it up-to-date.

**User Action:** User runs `git merge main` while on the `feature/new-login` branch.

**Git Output:**
```
Auto-merging src/auth.js
CONFLICT (content): Merge conflict in src/auth.js
Automatic merge failed; fix conflicts and then commit the result.
```

**User Input (Chatbot):** 🗣️ "Help! I tried to merge `main` and now it says 'CONFLICT' in `src/auth.js`. What does this mean and what do I do??"

---

## 2. AI Agent Analysis & Interaction

**Step 2.1: Git Status Scan**
*   The Agent runs `git status`, `git log --graph --oneline --all`, and detects the merge conflict state.
*   **Snapshot:**
    *   `git status` shows `Unmerged paths: (fix conflicts and run "git commit") ... both modified: src/auth.js`
    *   `git log` shows the current branch (`feature/new-login`) and the branch being merged (`main`) have diverged and both modified `src/auth.js`.

**Step 2.2: Contextual Explanation**
*   **Agent Output:** 🤖
    > Okay, it looks like you have a **merge conflict** in the file `src/auth.js`. This happens when Git can't automatically decide which changes to keep because *both* your current branch (`feature/new-login`) and the `main` branch have made changes to the *same lines* in that file since they diverged.
    >
    > Don't worry, this is common! Git needs your help to decide which version of the code (or a combination of both) is correct.
    >
    > **Here's a visual of your situation:**
    > ```mermaid
    > gitGraph
    >    commit id: "A"
    >    commit id: "B"
    >    branch main
    >    checkout main
    >    commit id: "C" type: HIGHLIGHT
    >    checkout feature/new-login
    >    commit id: "D" type: HIGHLIGHT
    >    checkout main
    >    merge feature/new-login id:"CONFLICT" type:REVERSE
    > ```
    > > *(Agent renders a simple graph showing divergence)*
    > Both commit `C` (from `main`) and commit `D` (from `feature/new-login`) changed the same part of `src/auth.js`.

**Step 2.3: Guided Resolution Steps**
*   **Agent Output:** 🤖
    > To resolve this, you need to:
    >
    > **1. Open the conflicting file:** `src/auth.js`
    >    Inside, you'll see markers like this:
    >    ```javascript
    >    <<<<<<< HEAD
    >    // Code from your current branch (feature/new-login)
    >    const user = getUserFromToken(token);
    >    =======
    >    // Code from the branch you are merging (main)
    >    const user = await findUserByToken(token);
    >    >>>>>>> main
    >    ```
    >    *   `<<<<<<< HEAD`: Marks the start of the changes from *your* current branch (`feature/new-login`).
    >    *   `=======`: Separates your changes from the incoming changes.
    >    *   `>>>>>>> main`: Marks the end of the changes from the `main` branch.
    >
    > **2. Edit the file:**
    >    *   Remove the `<<<<<<<`, `=======`, and `>>>>>>>` markers.
    >    *   Decide which code version to keep, or combine them if necessary, so the code is correct and does what you intend.
    >
    > **3. Stage the resolved file:**
    >    Once you've fixed `src/auth.js` and saved it, tell Git you're done resolving:
    >    ```bash
    >    git add src/auth.js
    >    ```
    >
    > **4. Complete the merge:**
    >    After staging all conflicting files, commit the merge:
    >    ```bash
    >    git commit -m "Merge branch 'main' into feature/new-login"
    >    ```
    >    (Git usually suggests a default message, which is often fine.)
    >
    > **Need help deciding which code to keep?** I can try to show you the changes side-by-side from commit `C` and `D` if that helps!
    >
    > **Feeling stuck?** You can always abort the merge and return to the state before you started:
    > ```bash
    > git merge --abort
    > ```
    > **⚠️ Safety Warning:** Aborting will discard any conflict resolutions you've already made.

---

## 3. User Action & Agent Monitoring

*   The user opens `src/auth.js`, edits it to resolve the conflict, saves the file.
*   User runs `git add src/auth.js`.
*   **Agent (detects change):** 🤖
    > Great! I see you've staged `src/auth.js`. `git status` now shows:
    > ```
    > On branch feature/new-login
    > All conflicts fixed but you are still merging.
    >   (use "git commit" to conclude merge)
    > 
    > Changes to be committed:
    >         modified:   src/auth.js
    > ```
    > You're ready for the final step: committing the merge. Would you like me to run `git commit` for you using the default message?
    >
    > `[Commit Merge]` `[Abort Merge]` `[Let me review first]`

---

## 4. Completion

*   If the user confirms, the Agent runs `git commit`.
*   It then shows the updated `git log --graph --oneline` to visualize the successful merge commit.

**Agent Output:** 🤖
> Merge complete! Your `feature/new-login` branch now includes the latest changes from `main` plus your conflict resolution.
> ```mermaid
> gitGraph
>    commit id: "A"
>    commit id: "B"
>    branch main
>    checkout main
>    commit id: "C"
>    checkout feature/new-login
>    commit id: "D"
>    checkout main
>    merge feature/new-login id:"M" type:HIGHLIGHT
>    checkout feature/new-login
>    commit id: "M"
> ```
> *(Agent shows updated graph with merge commit)*
> You can continue working on your feature. 👍 