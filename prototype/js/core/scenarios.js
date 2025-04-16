// Scenario data for the Git AI Agent demo
export const scenarios = {
  scenario1: {
    title: "Commit Mistake",
    gitInfo: {
      branch: "main",
      lastCommit: "abc1234",
      status: "clean"
    },
    filePath: "src/main.py",
    steps: [
      {
        type: "user",
        content: "Oh no, I just committed, but I included debug.log by mistake! How do I fix this?",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "I see you've committed something by mistake. Let me analyze what happened...",
        autoAdvance: true
      },
      {
        type: "status",
        content: "Check git status...",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "I can see you've included an unwanted file (debug.log) in your commit, and your main.py file wasn't properly updated. Don't worry - we can fix this!",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "Since this was your most recent commit and you haven't pushed it, we can use <code>git commit --amend</code> to modify it.",
        autoAdvance: true
      },
      {
        type: "command",
        explanation: "First, let's remove the debug.log file from the commit:",
        command: "git rm --cached debug.log",
        description: "This removes debug.log from Git's tracking without deleting the actual file from your system.",
        result: "debug.log: removed from index"
      },
      {
        type: "command",
        explanation: "Now let's add the correct version of main.py:",
        command: "git add main.py",
        description: "This stages your latest changes to main.py for the amended commit.",
        result: "Changes to main.py have been staged"
      },
      {
        type: "command",
        explanation: "Finally, let's amend the previous commit:",
        command: "git commit --amend --no-edit",
        description: "This updates your last commit with the current staged changes. The --no-edit flag keeps your original commit message.",
        result: "[main xyz9876] Add user authentication\n1 file changed, 5 insertions(+), 1 deletion(-)"
      },
      {
        type: "agent",
        content: "Great! I've successfully fixed your commit. The debug.log file has been removed, and main.py now contains your latest changes.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "Your commit history is now clean, and you can continue working from here. No one will know there was ever a mistake! 😉",
        autoAdvance: true
      },
      {
        type: "options",
        content: "Would you like to learn more about how to avoid this issue in the future?",
        options: [
          {
            label: "Yes, tell me more",
            nextStep: 11
          },
          {
            label: "No thanks",
            nextStep: 12
          }
        ]
      },
      {
        type: "agent",
        content: "To avoid committing unwanted files in the future, you can:<br>1. Use <code>git status</code> before committing to verify what's staged<br>2. Add log files to your .gitignore file<br>3. Use <code>git add -p</code> to review changes before staging them",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "Is there anything else you'd like to know about Git?",
        autoAdvance: false
      }
    ]
  },
  
  scenario2: {
    title: "Merge Conflict",
    gitInfo: {
      branch: "feature/new-login",
      lastCommit: "def5678",
      status: "conflict"
    },
    filePath: "src/auth.js",
    steps: [
      {
        type: "user",
        content: "Help! I tried to merge main and now it says 'CONFLICT' in src/auth.js. What does this mean and what do I do??",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "I see you've encountered a merge conflict in src/auth.js. Let me analyze the situation...",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "A merge conflict happens when Git can't automatically reconcile different changes to the same part of a file.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "In this case, both your feature/new-login branch and the main branch have modified the same lines in src/auth.js in different ways.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "To resolve this, you'll need to edit the conflicted file to decide which changes to keep. I'll help you through this step by step.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "Looking at the conflict markers in src/auth.js, I can see:",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "- Your branch (HEAD) uses a synchronous <code>getUserFromToken</code> function<br>- The main branch uses an asynchronous <code>findUserByToken</code> function with better security logging",
        autoAdvance: true
      },
      {
        type: "options",
        content: "How would you like to proceed with resolving this conflict?",
        options: [
          {
            label: "Keep main branch changes",
            nextStep: 9,
            type: "btn-primary"
          },
          {
            label: "Keep my changes",
            nextStep: 9,
            type: "btn-secondary"
          },
          {
            label: "Merge both changes",
            nextStep: 9,
            type: "btn-primary"
          }
        ]
      },
      {
        type: "agent",
        content: "Based on best practices, I recommend keeping the main branch changes which include the security logging features.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "After editing the file to resolve the conflict, you'll need to stage and commit the changes.",
        autoAdvance: true
      },
      {
        type: "command",
        explanation: "Let's stage the resolved file:",
        command: "git add src/auth.js",
        description: "This tells Git that you've resolved the conflict in this file.",
        result: "File src/auth.js has been staged"
      },
      {
        type: "command",
        explanation: "Now let's complete the merge with a commit:",
        command: "git commit -m \"Merge branch 'main' into feature/new-login\"",
        description: "This creates a merge commit that combines the changes from both branches.",
        result: "[feature/new-login abc123] Merge branch 'main' into feature/new-login\n1 file changed, 3 insertions(+), 1 deletion(-)"
      },
      {
        type: "agent",
        content: "Great! The merge is now complete. Your feature/new-login branch now includes all the changes from main, and the conflict has been resolved.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "You can continue working on your feature or create a pull request if you're ready.",
        autoAdvance: false
      }
    ]
  },
  
  scenario3: {
    title: "Tidy History",
    gitInfo: {
      branch: "feature/button-styling",
      lastCommit: "abc1234",
      status: "modified"
    },
    filePath: "terminal",
    steps: [
      {
        type: "user",
        content: "My branch has like 4 small commits for the button styling. Can I combine them into just one commit before I make a pull request?",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "I see you want to clean up your commit history. Let me analyze your current situation...",
        autoAdvance: true
      },
      {
        type: "status",
        content: "Check git status...",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "Looking at your git log, I can see you have 4 small commits related to button styling:<br><code class='code-block'>abc1234 Fix typo in login form<br>def5678 Update login form style<br>ghi9012 Fix login form alignment<br>jkl3456 Add login functionality</code><br>Yes, we can definitely combine these into a single, clean commit using Git's interactive rebase feature.",
        autoAdvance: true
      },
      {
        type: "warning",
        content: "Rebasing rewrites history. This is safe if you haven't pushed these commits to a shared branch. If you have already pushed, you'll need to force push after rebasing, which requires caution.",
        autoAdvance: true
      },
      {
        type: "command",
        explanation: "Let's start an interactive rebase to combine these commits. I'll open VS Code to edit the rebase file:",
        command: "EDITOR='code --wait' git rebase -i HEAD~4",
        description: "This opens VS Code showing the last 4 commits. You'll need to edit this file to determine how to combine the commits.",
        result: "# This is a simulated interactive rebase. In VS Code, you'll see:\n\npick abc1234 Fix typo in login form\npick def5678 Update login form style\npick ghi9012 Fix login form alignment\npick jkl3456 Add login functionality\n\n# To squash commits, change the word 'pick' to 's' for all commits except the first one",
        autoAdvance: true
      },
      {
        type: "status",
        content: "Use the editor to squash the commits...",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "In the editor that opens, change 'pick' to 's' (squash) for all commits except the first one. This will combine all the commits into the first one.",
        autoAdvance: true
      },
      {
        type: "agent",
        content: "After saving and closing that file, another editor will open where you can edit the combined commit message. Write a clear, descriptive message like \"Implement styled login button\".",
        autoAdvance: true
      },
      {
        type: "command",
        explanation: "Let's check the result of our rebase:",
        command: "git log --oneline",
        description: "This shows the commit history after rebasing.",
        result: "def5678 Implement styled login button\njkl3456 Add login functionality\nmno7890 Initial commit"
      },
      {
        type: "agent",
        content: "Perfect! The 4 small commits have been combined into a single, clean commit with a descriptive message.",
        autoAdvance: true
      },
      {
        type: "warning",
        content: "If you've already pushed this branch to a remote repository, you'll need to force push with: git push --force-with-lease origin feature/button-styling"
      },
      {
        type: "agent",
        content: "Your commit history is now tidy and ready for a pull request. This makes it easier for reviewers to understand your changes.",
        autoAdvance: false
      }
    ]
  }
}; 