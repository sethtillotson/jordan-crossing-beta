# Using Copilot with This Project

## Quick Start

1. **Clone the repo** (if you haven't):
   ```bash
   git clone https://github.com/sethtillotson/jordan-crossing-beta.git
   cd jordan-crossing-beta
   code .
   ```

2. **Open Copilot Chat** in VS Code:
   - `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
   - Or click the Copilot icon in the left sidebar

3. **Paste the handoff prompt**:
   - Open `COPILOT_HANDOFF_PROMPT.md`
   - Copy all the content
   - Paste it into a new Copilot Chat session
   - Hit Enter

4. **Ask Copilot to help**:
   ```
   I need to redesign the landing page (index.html) to match the v2 design system. 
   Can you help me create a new version with the gold/dark aesthetic and card-based layout?
   ```

## Copilot Chat Commands

Use these in the chat to reference files:

```
@file:README.md
@file:assets/design-v2.css
@file:records/08-30-compass-v2.html
```

Example:
```
@file:records/08-30-compass-v2.html
Can you explain the structure of the discern section?
```

## Tasks Copilot Can Help With

- **Code generation**: "Generate HTML for a new response option in the discern section"
- **Styling**: "Update the card hover animation to be more subtle"
- **Debugging**: "Why isn't the carry-question button showing in localStorage?"
- **Refactoring**: "Can you refactor the mystery-v2-logic.js to use modules?"
- **Documentation**: "Write a comment block explaining the initCarryQuestion() function"
- **Testing**: "Create a checklist for testing the return panel navigation"

## Pro Tips

1. **Reference the design system**: Ask Copilot to reference `design-v2.css` when styling
2. **Use file context**: Start messages with `@file:` to give Copilot relevant code context
3. **Ask for explanations**: "Explain how the responsive grid works in this CSS"
4. **Iterate**: Follow up with refinements; Copilot keeps context across messages
5. **Check before committing**: Have Copilot review code before you push

## Example Session

```
User: @file:COPILOT_HANDOFF_PROMPT.md I want to add a search feature to threads.html

Copilot: [Explains the current structure, suggests approach]

User: Can you show me a code example for a simple search input and filtering?

Copilot: [Generates HTML + JS code]

User: That looks good. Now integrate it into threads.html keeping the v2 design

Copilot: [Shows the full updated threads.html]

User: Perfect. I'll commit and push this.
```

## When to NOT Use Copilot

- Don't let it rewrite large sections without your review
- Don't commit untested code from Copilot suggestions
- Don't deviate from the design system without reason
- Always test in browser before pushing

## Workflow

1. **Open Copilot Chat** → Ask a question/request
2. **Review the suggestion** → Check it matches design philosophy
3. **Test locally** → Open in browser or Live Server, check console
4. **Commit & push** → `git add . && git commit -m "..." && git push`
5. **Verify on GitHub Pages** → Check deployed site ~30 seconds later

---

**Remember**: The design philosophy is clear, gentle, and honest. No flashy over-engineering. Every interaction should affirm the reader's choice without manipulation.

When in doubt, reference the original records to maintain that pastoral, plain tone.
