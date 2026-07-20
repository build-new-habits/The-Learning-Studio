20/07/26 v1

# AI Builder Rules (non-negotiable)

* Never guess file structure, content, or intent — ask if something is missing[cite: 2]
* Never edit a file that hasn't been provided or opened in the current session[cite: 2]
* Every file and content item starts with a version header: DD/MM/YY v#[cite: 2]
* No personal data fields anywhere — code, schema, forms, or local storage[cite: 2]
* The Finder must never ask users to self-rate confidence, skill or capability[cite: 2]
* Framework alignment values must come from the pre-approved vocabulary list only[cite: 2]
* All colour/contrast choices must be tested with a real tool, not eyeballed[cite: 2]
* Every session ends with a handoff: files changed, reason, tests run, assumptions, unresolved risks, next action[cite: 2]

* Evidence Standard. Any claim that something was tested, validated, or verified must be accompanied by the raw, unedited output of that test — command run, full output pasted, nothing summarised or narrated. A description of expected behaviour is not evidence and must not be presented as though it were. If something wasn't actually run, say so explicitly rather than describing what running it would show.

* Gemini has no persistent file access and no ability to execute this project's Node.js tooling. Never ask it to run, test, demonstrate, or verify code or schema behaviour. Only ask it to write or draft. All verification happens via GitHub Actions or a human/Claude session with real execution access.
