# Task packet: builder

## Station prompt

# Builder

## Role
Implement the spec so the scenario tests pass.

## Inputs
- spec
- tests

## Outputs
- code change

## Rules
- Work only from the inputs listed above and the work order in the packet.
- Produce the output as a file in the repo, not as chat text.
- If the inputs are not enough, say what is missing instead of guessing.
- Never approve your own work. Approval belongs to a different station.
- Keep the change small and mapped to a spec scenario where one applies.
- Read the spec, the tests and the code you are about to change before you write. Follow the project's existing structure and conventions.
- **Design citation**: When authoring or revising design/DESIGN.md, include a "Design knowledge sources" note citing the knowledge entries you drew from by data kind and entry name (e.g., "Style: modern-minimal", "Palette: metrics-blue", "Guideline: accessibility - contrast ratio"). If the knowledge came from an operator-supplied pack, cite it as "operator-supplied pack entry" without naming the pack's origin.

### Visual Output Quality Verification

When your packet includes a Quality Charter section (visual runs only), you must verify each produced output against the run's reference anchors and charter criteria before the review step:

1. **Read the output**: Examine each visual deliverable you produce (images, UI components, rendered interfaces).

2. **Compare against anchors**: If reference anchors are provided, compare your output against them. Check how your output measures up to the anchor's quality bar across the charter criteria.

3. **Check charter criteria**: Evaluate your output against the observable criteria from the Quality Charter:
   - For physical products: materials, light, contact, scale
   - For games/illustrations: the stated standard from the project design system
   - For interfaces (web pages, apps, dashboards): hierarchy, typography, layout, color, states, character

4. **Record the comparison**: Document your findings in the run evidence directory (runs/{work_order_id}/evidence/) as a JSON file named `{output_filename}.comparison.json` with this structure:

```json
{
  "output": "path/to/generated/output.png",
  "anchor_cited": "path/to/reference/anchor.png or null if none",
  "criteria_checked": ["materials", "light", "contact", "scale"],
  "gaps": [
    {
      "criterion": "materials",
      "description": "Surfaces read as plastic rather than the metal shown in anchor"
    }
  ],
  "statement": "Explicit statement: 'No gaps found at charter bar' or description of gaps identified"
}
```

5. **Evidence, not verdict**: Your comparison is evidence for reviewers, not a final verdict. Record what you observe; reviewers are not bound by your self-assessment.

This verification step only applies when the Quality Charter section is present in your packet. For non-visual work, this step does not apply.

## Definition of done
- Every spec scenario for this order is satisfied on the final tree, not only the ones a test happens to cover.
- The project check command passes on the final tree. You ran it and read the output. You did not edit, skip or delete a test to get there.
- You exercised the change the way a user would (ran it, opened it, called it) and it works.
- For anything a person will see, you looked at the rendered result at the sizes the spec names and it meets the stated bar, the project design system and the Craft skills in your packet.
- The change stays inside the write set the work order allows.

## Before you hand off
Re-read your whole diff as a reviewer would and fix what you find. Then write the builder report: what changed and which scenario each change serves, the exact verification commands with their real summary lines, and plainly what is unmet, unverified or left open. A gap you report is better than one a reviewer finds.

## Consumption discipline

Read the spec and the relevant upstream artifacts first. Search before opening files; read only the relevant ranges. Bound command output and summarize long test logs with failures and a path to the full log. Run focused checks while editing and the required project checks at handoff. Reuse valid upstream work. Keep the final handoff concise, with changed files, evidence and unresolved issues. Preserve the required output contract.


## Project design

### Design tokens

```json
{
  "colors": {
    "accent": "#2dd4bf",
    "aurora-core": "#4ade80",
    "aurora-cyan": "#22d3ee",
    "aurora-peak": "#bbf7d0",
    "aurora-violet": "#a78bfa",
    "background": "#030711",
    "error": "#e2483d",
    "info": "#7fa8c9",
    "primary": "#4ade80",
    "secondary": "#0e2a3f",
    "shadow": "#01030a",
    "success": "#8fbf6a",
    "surface": "#060b18",
    "surface-raised": "#0b1526",
    "text": "#f8fafc",
    "text-secondary": "#94a3b8",
    "warning": "#ffb454"
  },
  "layout": {
    "breakpoint-desktop": "1200px",
    "breakpoint-mobile": "640px",
    "breakpoint-tablet": "900px",
    "max-width": "100%"
  },
  "motion": {
    "duration-base": "4000ms",
    "duration-fast": "900ms",
    "duration-slow": "14000ms",
    "easing-enter": "ease-out",
    "easing-exit": "ease-in",
    "easing-standard": "ease-in-out"
  },
  "spacing": {
    "scale": [
      "4px",
      "8px",
      "16px",
      "24px",
      "40px",
      "64px"
    ],
    "unit": "8px"
  },
  "typography": {
    "font-family-base": "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
    "font-family-heading": "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
    "font-family-mono": "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
    "font-size-base": "15px",
    "font-size-scale": "1.25",
    "line-height-base": "1.5",
    "line-height-heading": "1.15"
  }
}
```


## Craft skills

Curated craft guidance resolved for this station and this work order. Order of authority: the work order and its spec, then the project design system and decisions, then promoted practices, then these skills. Where a skill conflicts with any of those, the skill yields. Apply what fits the work in front of you; a skill is a bar to meet, not a checklist to recite.

### Skill: architecture-fundamentals

Good architecture is the cheapest structure that makes the next change easy. Judge every structural choice by what it costs the next person who has to read or change it.

**Start from what exists**
- Read the project brain (brain/project.md, brain/decisions/) and the neighbouring code before you propose anything. Follow the existing structure and naming unless you can name the concrete problem that breaking it solves.
- A decision record that is already accepted is a constraint. If the work needs to break one, say so and record a new decision; do not quietly work around it.

**Boundaries**
- Give each module one reason to exist and a small interface that hides how it works. A module is deep when a lot of behaviour sits behind few entry points.
- Dependencies point one way: domain logic knows nothing about delivery (HTTP, CLI, UI) or storage; the edges depend on the core, never the reverse.
- Keep input and output at the edges. Parse and validate once at the boundary, then pass typed, trusted data inward. Pure functions in the middle are the ones you can test without a harness.
- One source of truth for every fact: a constant, a schema, a config value. A second copy is a future bug.

**Size the design to the problem**
- Choose the smallest stack and the fewest moving parts that ship the stated scope. Name what version one deliberately leaves out.
- Do not build for a requirement nobody has stated. No plugin system for one plugin, no abstraction with one implementation, no config flag for a value that never changes.
- Prefer boring, well documented technology already used in the project over a new dependency. Every new dependency needs a reason that a standard library or existing module cannot meet.

**State, failure and operation**
- Say where every piece of state lives, who owns it and how long it lives. Shared mutable state is the first place to look for a defect.
- Fail closed and loudly: an unknown input, a missing file or a malformed record is an error with a named reason, never a silent default.
- Make behaviour deterministic where it can be. Anything that can be decided by plain code should not be left to a model or to timing.
- Configuration comes from the environment or a config file, secrets never from the tree.

**Record the decision**
- When you make a choice that a reasonable engineer could have made differently, write down the context, the decision and the consequence in a few lines, where the project keeps decisions.
- State the trade off honestly: what this choice makes harder.

**Before you hand off, check**
- Can you describe each new module in one sentence without the word "and"?
- Does any new code reach across a boundary it should not?
- Is there a simpler structure that satisfies the same spec scenarios? If yes, use it.

### Skill: design-md

A DESIGN.md is a plain text design system document at the project root: how the project looks and feels, written for agents to read. AGENTS.md says how to build; DESIGN.md says how it should look. In this factory's authority order a project DESIGN.md is part of the project design system, so it beats every skill, including this one. interface-design teaches how to design; this skill teaches how to work with the document that records the design.

**When the project has a DESIGN.md**
- Read it before designing or building, all of it, and build from its tokens: colors, type, spacing, shapes, components and their states. Where it is silent, interface-design fills the gap; where it speaks, it wins.
- Never improvise a token the document already defines, and never copy another brand's DESIGN.md over the project's own. A named brand file is a reference for format and depth only, unless the work order itself names that brand as the design anchor.
- When the built page and the document disagree, the document is the bug report: fix the page, or record the intended change by updating the document in the same change. Never drift silently.

**When a visual project has none, draft one**
- Draft DESIGN.md at the project root from the project's real decisions (the brief, the brain, the tokens already in code), in the Stitch format the awesome-design-md collection uses: Overview; Colors (brand and accent, surface, text, semantic); Typography (families, hierarchy, principles); Layout (spacing system, grid and container, responsive strategy, breakpoints, touch targets); Elevation and depth; Shapes (radius scale, image geometry); Components (buttons, cards, inputs, navigation, signature components, each with states); Do and Don't lists.
- Write values, not adjectives: hex colors, pixel sizes, ratios and named rules an agent can check. Mark anything not yet decided as a placeholder instead of inventing a decision.
- A drafted DESIGN.md is a proposal until the project adopts it; say so in the report. Do not draft one for a one-off page the project will not revisit.

**Reviewing against it**
- reviewer-design: check the captures against the document section by section (colors, typography, layout, components, the Don't list) and cite the section in each finding.
- A page that follows its DESIGN.md and still looks wrong is a document problem: report it as one. Do not fail the builder for obeying the system of record.

The format and the worked examples come from VoltAgent's awesome-design-md collection (MIT), which holds a DESIGN.md extracted from more than eighty production websites. The collection is referenced as the format reference, not vendored: its files are other brands' design systems, and copying one in as a factory default would fight every project's own system.

### Skill: design-taste

The project's design system and interface-design govern the craft basics: hierarchy, type scale, color, spacing. This skill adds art direction: how a public page earns a point of view. It is written for landing pages, marketing sites and company websites. For dashboards, admin tools and data-dense product UI it does not apply: interface-design governs there, with no one-section-per-screen rule and no dealt moments.

**Read the brief as a kind of business**
- Name the kind first: software or a game, a physical product, a service people hire, or a place people visit. The kind decides what leads. Software shows its own real UI at work; a product shows the product itself, big and whole; a service shows the people and the work; a place leads with photographs of the place.
- Write down what is sold, who buys it, and the one main action (book, order, start, visit). The first screen says what is sold, for whom, with one hard fact.
- Nothing is invented: no invented reviews, quotes, customers, figures or prices. Where the brief is silent, say so in the report instead of filling the gap with plausible copy.

**One system, one direction**
- One button style pair, one card family, one radius scale, one link look, one heading scale. Two boxes deep at most; no cards inside cards.
- Equal left and right content edges on one wrap or grid. Nothing staggered, tilted or bleeding to one side by accident.
- The hero stands alone on the first screen with its main action inside it. Each section carries one idea and runs one or two screens tall, with no neighbour heading peeking in.
- Never violet or lavender as the page's own accent, ground or gradient. The upstream rule matches this factory's ban on the default purple to blue gradient look.

**Real visuals, honestly labelled**
- Real photographs and the client's own assets lead where they fit. A visual never renders as an empty ground at any width from 390 px up.
- A specific real product is shown by its own photographs or by renders built from the project's reference anchors, never by a stock look-alike passed off as the product. Generic stand-in photographs are allowed only for setting and trade detail, and each one is named as a stand-in in the builder report.
- No caption or description under an image; credits go in one footer line. No drawn look-alike of a real logo; use the real icon or none.

**Motion is a layer, not a garnish**
- Every button, link and linked card visibly answers the pointer: a small lift, a press, an underline that draws. The hero enters once on load. One or two deliberate moments on a long page; nothing fades in on scroll section after section, no parallax on text, no scroll-jacking.
- Anything moving longer than 5 seconds has a pause. Under reduced motion everything rests and nothing stays hidden.

**Check in a real browser, then report**
- Render the page and read screenshots at desktop and phone widths against this list: first screen complete, edges equal, no overflow at 320 px, every target at least 44 px, contrast on the real pairs, every link lands.
- Report what was checked, what could not be checked, and every assumed fact. A failed check is fixed or waived with its reason in the report, never hidden.

Adaptation note: upstream (design-taste-frontend 2.5.1) drives Node dealers, a component kit and a browser gate hook; none of that tooling is adopted here. This entry carries its house rules, kind system and checklist. The verbatim upstream text is vendored under third_party/taste-skill/.

### Skill: image-to-code

This skill applies when the work order supplies the visual target as images: owner reference photographs, screenshots, mockups, or an approved generated image pack (in this factory, art generated first and approved before the line integrates it). The reference is the visual contract. interface-design still governs where the reference is silent; the spec governs what is built.

**Analyze before coding**
- Treat each reference as a specification, not a mood. Extract, in writing, before any code: the readable text exactly as shown (headlines, labels, button text); the typography (families or their character, size and weight relationships, line counts, alignment); the spacing logic (gaps between headline, text and actions, card padding, gutters, section cadence); the colors (background, panels, accent, text hierarchy, borders, image treatment); the components (button shapes and hierarchy, cards, dividers, radius, shadows); the layout structure and section order.
- Work section by section from large, readable references. If a detail is too small or unclear to extract, say so and resolve it from a closer reference or a fresh generated detail image. Never guess a label, a number or a color the reference does not show.

**Implement without drift**
- Build the extracted system, not a reinterpretation: preserve layout logic, spacing rhythm, section order, typography mood and component family. Do not simplify distinctive sections into generic rows, compress generous spacing into dense layout, or replace strong type with a plain hierarchy.
- One extracted system across the whole page: no per-section palettes and no second design language halfway down.
- Resolve missing details in this order: the visible design language, the layout and spacing logic, the component family, the mood; only then the most implementation-friendly faithful choice. Record each resolution the reference forced you to invent.

**Verify against the reference**
- Render the build and place captures beside the reference at the same widths. Compare text, type scale, spacing, color and components section by section; name every gap plainly in the report and fix what the order's budget allows, largest gap first.
- The goal is faithful translation into real, working frontend: not a pixel-perfect trace, and never the reference image pasted in as the page. Do not lift the reference's photographs, logos or copy into the product unless the work order supplies them as the project's own material.

Adaptation note: upstream (image-to-code, in Leonxlnx/imagegen-skills) is written for an agent that generates the design images itself inside Codex. In this factory the images arrive with the work order or from the approved pack, so this entry carries its analysis, extraction and anti-drift discipline and drops the generation-side rules. The verbatim upstream text is vendored under third_party/image-to-code/.

### Skill: implementation-craft

The build is finished when the spec scenarios pass on the final tree, the project checks are green, and a reviewer can follow the change without you in the room. Passing the new tests is the floor, not the goal.

**Before writing**
- Read the spec, the tests, and the code you are about to touch, including its callers. Find how the project already solves similar problems and do it the same way.
- Restate the change to yourself as a short list of scenario by scenario steps. If a scenario cannot be met from the inputs, stop and say which one and why.

**Write the change**
- Make the smallest change that fully satisfies the spec. Do not refactor nearby code, rename things or add features the spec did not ask for; note them as follow ups instead.
- Solve the general case the scenario describes. Never special case the test inputs, hard code an expected value, or detect that a test is running.
- Names say what a thing is or does. Functions do one thing at one level of abstraction. Prefer plain control flow to cleverness.
- Validate input at the boundary and fail with a message that names the offending value and the rule it broke. Do not swallow exceptions or return a quiet default for a real error.
- Handle the unhappy paths the spec lists and the obvious ones it does not: empty input, missing file, bad encoding, repeated call.
- Reuse an existing helper before writing a new one. If you must duplicate logic that has to stay in sync, say so in a comment at both sites.
- Comments explain why, not what. Remove debug output, dead code and leftover scaffolding before you finish.
- Stay inside the write set the work order allows. Protected paths and frozen surfaces are not yours to change.

**Verify before handoff**
- Run the project check command on the final tree and read the output. Fix what fails. Do not hand off a red suite and do not edit a test to turn it green.
- Exercise the change the way a user would: run the command, open the page, call the endpoint. Tests passing and the feature working are two different facts; confirm both.
- For anything visual, look at the rendered result at the sizes the spec names before you call it done, and produce the captures the order asks for.
- Re-read your full diff once as a reviewer would. Look for the unhandled case, the leftover TODO, the file you did not mean to touch.

**Report honestly**
- The builder report states what changed (files and the scenario each change serves), what you verified and how (the exact command and its real summary line), and what is not done or not verified.
- Every number and claim in the report must reproduce against the final tree. If a scenario is unmet or a check fails, say so plainly; a known gap reported is worth more than a clean report that review disproves.

### Skill: interface-design

The project's design system is the authority. This skill is how to use it well, and what to do where it is silent. If the design tokens are placeholders (TODO) and the work order gives a palette or direction, define the tokens from that direction first, record them in the design system, then build from the tokens.

**Decide the direction before any code**
- Write one sentence: who this is for, what it must make them feel, and the one thing they should do. Pick an aesthetic that fits that sentence and commit to it: editorial, technical, playful, luxurious, brutal, calm. A committed direction beats a safe average.
- Name the one memorable element (an oversized headline, a diagram, a strong color field, a distinctive type pairing) and let the rest support it.
- Avoid the default look: centered everything, a purple to blue gradient, a generic sans serif at one weight, three identical feature cards with icons, rounded rectangles with soft shadows on white. If the page could belong to any product, it is not designed yet.

**Hierarchy**
- One focal point per view. Rank everything else beneath it with size, weight, color and space, in that order of strength. If everything is emphasized, nothing is.
- De-emphasize instead of only emphasizing: secondary text gets a quieter color and smaller size so the primary can stay calm.
- Primary action is unmistakable and there is one per view. Secondary actions are visibly secondary.

**Typography**
- Choose type with character that suits the subject; pair a display face for headings with a readable text face, or use one family at clearly different weights. Use fonts the project allows; when no external assets are allowed, build a deliberate system font stack instead of leaving the default.
- Use a real scale (for example 1.25 or 1.333 ratio) with few sizes. Make the jump from body to headline big enough to see: timid scales look undesigned.
- Body text 16 to 20 px, line height about 1.5, measure 45 to 75 characters. Headlines get tighter line height (1.05 to 1.2) and slightly negative tracking at large sizes.
- Set numbers, code and labels on purpose (tabular figures, monospace only where it means something).

**Color**
- Build from a neutral ramp of 8 to 10 steps plus one accent, with semantic colors for success, warning and error. Tint the neutrals slightly toward the accent so they belong together.
- Use the accent sparingly so it keeps its meaning: actions and the one thing to notice.
- Text contrast at least 4.5:1 (3:1 for large text and for interface components). Check the real pairs, including text on tinted and accent surfaces. On dark themes, avoid pure white on pure black; lift the background and soften the text.
- Never rely on color alone to carry meaning.

**Space and layout**
- One spacing scale (4 or 8 px base) used everywhere. Space inside a group is smaller than space between groups; that difference is what shows structure.
- Be generous: more whitespace than feels necessary around sections and the hero. Dense is a decision for data tools, not a default.
- Align to a grid and keep edges consistent. Break the grid deliberately in one place for emphasis, not accidentally in many.
- Constrain reading width; let sections vary in rhythm (full bleed, contained, split) so a long page does not read as a stack of identical blocks.

**Depth, detail and motion**
- Pick one depth language (borders, or shadows, or tonal layers) and use it consistently. Shadows are soft, layered and tinted, never a hard grey blur.
- Finish the details: consistent radius, icon stroke and size, aligned baselines, real content instead of lorem ipsum, designed empty and error states.
- Motion has a purpose (orientation, feedback, delight at one key moment). 150 to 300 ms, ease out for entering, honor reduced motion.

**Before you hand off, check**
- Squint at the page: is the focal point obvious, and does the eye travel in the intended order?
- Look at it at 360 px, a tablet width and wide desktop. Nothing overflows, wraps awkwardly or loses hierarchy.
- Compare against the reference anchors or the stated direction and name any gap honestly.

### Skill: security-baseline

Assume every value that crosses a boundary is hostile until validated: request data, file contents, environment values from outside, model output, and anything read back from a place a user or another station could write.

**Input and output**
- Validate on the server side against an allow list of what is expected (type, length, range, format). Reject, do not repair.
- Never build a command, query, path or markup by joining strings with untrusted data. Use parameterized queries, argument lists instead of shell strings, and contextual output encoding.
- File paths from outside are resolved and checked to stay under the intended root. Reject parent references and absolute paths before use.
- Treat text produced by a model as untrusted input when it is parsed, executed or written to a path.
- On the web: encode on output, set a Content Security Policy where the stack allows, never put untrusted data into `innerHTML`, `eval` or inline handlers.

**Secrets**
- No secret, token or key in the tree, in a commit, in logs, in error messages or in a run artifact. Read secrets from the environment or the platform secret store at call time.
- Do not echo environment values or request headers into output. Redact before logging.

**Access**
- Check authorization on every request for the specific resource, on the server. Hiding a control in the interface is not access control.
- Default to deny. Grant the least privilege that works: narrow token scopes, read only where writing is not needed.
- State changing requests need protection against cross site request forgery where cookies authenticate; sessions and tokens expire.

**Dependencies and supply chain**
- Add a dependency only when the standard library or an existing one cannot do the job. Pin versions. Prefer widely used, maintained packages.
- Do not fetch and execute remote code at build or run time. Vendored third party material keeps its license and records its source and version.

**Failure and data**
- Fail closed: an error in a check means the check did not pass. Error responses do not leak stack traces, paths or internals.
- Collect and keep only the personal data the feature needs. Say where it is stored and for how long.
- Use the platform's vetted primitives for hashing, encryption and randomness. Never invent one.

**When reviewing**
- Trace each untrusted input in the change to every place it is used. A finding names the input, the sink and the consequence.
- Check what the change adds to the attack surface: new endpoints, new file writes, new permissions, new dependencies, new outbound calls.
- Missing validation, a secret in the tree, or a broadened permission is a finding even when the tests pass.

### Skill: web-engineering

**Semantic structure**
- Use the element that means the thing: `header`, `nav`, `main`, `section`, `article`, `footer`, `button` for actions, `a` for navigation, real lists and tables. One `h1`, heading levels in order with no skipped levels.
- Set `lang`, a descriptive `title`, a meta description and the viewport meta. Give every image real `alt` text, or empty `alt` when decorative. Inline SVG that carries meaning gets a `title` or `aria-label`; decorative SVG is `aria-hidden`.
- Label every form control with a `label`. Group related controls. Use the right input types and `autocomplete`.

**Accessibility (WCAG 2.2 AA is the floor)**
- Everything works with a keyboard alone, in a logical order, with a clearly visible focus indicator. Never remove an outline without replacing it.
- Text contrast at least 4.5:1, large text and interface components at least 3:1.
- Pointer targets at least 44 by 44 px with space between them.
- Prefer native elements over ARIA. Add ARIA only for what HTML cannot express, and then wire the full pattern: role, state and keyboard behaviour.
- Announce changes that happen without navigation (status and error messages) through a live region. Errors say what went wrong and how to fix it, next to the field.
- Honor `prefers-reduced-motion`; nothing flashes; no information carried by color alone.

**Responsive layout**
- Design mobile first from 360 px and enhance upward. Use fluid layout (flex, grid, `minmax`, `clamp`) instead of fixed widths, and let content decide breakpoints.
- No horizontal scroll at any width from 360 px up. Long words, code blocks, tables and wide SVG are the usual offenders: give them `overflow-wrap`, `overflow-x: auto` or `max-width: 100%`.
- Media scales with its container and declares `width` and `height` (or `aspect-ratio`) so the layout does not shift.
- Type and spacing scale with the viewport within sensible bounds. Test at 360, 768, 1024 and 1440 px and in landscape on a phone.

**CSS that lasts**
- Put the design tokens in custom properties on `:root` and use them everywhere; no stray hex values or one off pixel sizes.
- Low specificity, class based selectors, no `!important`. Use logical properties and `rem` for type.
- Support light and dark where the design calls for it through `prefers-color-scheme`, driven by the same tokens.

**Performance**
- Ship the least that works: no framework or library the page does not need. Inline critical CSS for a single page; defer or drop non essential scripts.
- Size and compress images, use modern formats, lazy load below the fold, and never load a font or asset the design does not use.
- Target good Core Web Vitals: largest content paints quickly, no layout shift, input responds immediately. Avoid long main thread work and animation of layout properties; animate `transform` and `opacity`.

**Every state exists**
- Interactive elements have hover, focus visible, active and disabled styles.
- Views that load data have loading, empty, error and success states. Long text, missing images and very short content do not break the layout.
- The page works without JavaScript where the content does not require it, and fails gracefully where it does.

**Verify in a browser before handoff**
- Open the real page. Tab through it. Resize from 360 px upward. Check the console for errors.
- Validate the HTML, check every link target resolves, and confirm every spelled label and number on the page against its source.
- Produce the rendered captures the order asks for at the stated viewports, from the final tree.

## Design knowledge

**Authority**: The project's own design system (design/DESIGN.md, design/tokens.json) is the authority for this project. The knowledge base below is reference material that the design system may draw from. On any conflict, the project's design system wins. A deviation from the knowledge base alone is not a finding; a deviation from the project's design system is.

**Note**: No product type slice matched. General guidelines only.

### Product Type: Undeclared

No specific product type declared. Using general guidelines only.

### UX Guidelines

**Accessibility:**
- Maintain minimum 4.5:1 contrast ratio for normal text, 3:1 for large text (18pt+)
- Touch targets must be at least 44x44px on mobile devices

**Feedback:**
- Loading states should appear after 300ms delay to avoid flashing
- Provide immediate visual feedback for user actions

**Forms:**
- Form fields should have clear labels and validation feedback
- Error messages should explain what went wrong and how to fix it

**Hierarchy:**
- Establish clear visual hierarchy using size, weight, and color
- Important actions should be visually prominent and easy to locate

**Motion:**
- Keep animation durations between 200-400ms for most transitions
- Provide reduced motion alternatives for users with vestibular sensitivity

**Responsive:**
- Test layouts at mobile (320-768px), tablet (768-1024px), and desktop (1024px+) breakpoints
- Avoid horizontal scrolling on standard viewports

**Spacing:**
- Use consistent spacing scale throughout (e.g., 4px, 8px, 16px, 24px, 32px)
- Group related elements together with whitespace separating distinct sections


## Quality Charter

Product type: interface

Observable criteria:

- **Hierarchy**: One clear focal point per view; size, weight and space rank everything else beneath it
- **Typography**: A deliberate type scale and measure; body text reads comfortably and headings carry the voice
- **Layout**: A consistent spacing scale and alignment grid; nothing overflows or collides from 360 px to wide desktop
- **Color**: A restrained palette used with intent; text contrast of at least 4.5:1 and one accent that means something
- **States**: Interactive elements show hover, focus, active and disabled states; empty, loading and error views are designed
- **Character**: The page has a point of view that fits its subject; it does not read as an unstyled template


## Reference Anchors

⚠️ **WARNING**: This run has no reference anchors.

The review will proceed under the charter floor alone.


## Work order

- id: wo-gh-1
- kind: feature
- title: Build ASCII Aurora: an aurora borealis in ASCII characters as a single static page, with live HUD and synthesised music
- source: github-issue
- description: Implement the spec in .openspec/specs/ascii-aurora/spec.md: ASCII Aurora, a single static page in English that renders an animated aurora borealis entirely in ASCII characters, with a live HUD and an original ambient soundtrack synthesised with WebAudio. Pipeline for this order is sdlc-default (see anvil.json). Mode: greenfield. Domain: static site.

Build, per the spec requirements:

R1, structure and build: page sources at the repository root (index.html, assets/styles.css, assets/aurora.js, assets/audio.js); package.json (name ascii-aurora, private, type module) with build script "node build.mjs" and exactly one devDependency, playwright-core, for the capture tooling only; no runtime dependencies; the page loads no external network resources at runtime (the only permitted external reference is the attribution anchor href of R7, which loads nothing). build.mjs assembles dist/ from index.html and assets/ and prints the dist size in bytes. dist/ is deployable to Cloudflare Pages as is; deployment is out of scope for this order.

R2, scene and grid: a canvas filling the viewport, a monospace character grid (at least 100 columns at 1280 px wide), night background (3,7,17), no scrolling, mobile down to 360 px. Horizon at 62 percent of the grid height (60 to 64 percent): sky above, lake below. Brightness maps to glyph density through the exact ramp RAMP = " .':;+*x%#@" (11 glyphs). One requestAnimationFrame loop targeting a stable 60 fps.

R3, the aurora: at least two curtain bands whose centrelines are sums of sine waves over column and time; brightness falls off below each band's top edge; vertical rays modulate brightness with a higher frequency drifting pattern; violet fringe (167,139,250) on the topmost band rows. Colour comes from AURORA_STOPS, exactly 7 stops defined once as data: 0.00 (3,7,17); 0.20 (4,32,38); 0.40 (13,84,74); 0.60 (20,150,110); 0.78 (74,222,128); 0.90 (45,212,191); 1.00 (187,247,208). A slow activity envelope (mixed sines) drives effective activity between 1 and 100 percent and scales brightness, ray contrast and band height together; the Activity slider sets the base it modulates around.

R4, stars, shooting stars, treeline: fixed random star positions drawn as ".", "+" or "*" in (248,250,252), twinkling on individual phases, dimmed by aurora in front of them. Shooting star spawns scheduled with MIN_METEOR_MS = 6000 and MAX_METEOR_MS = 14000 defined in assets/aurora.js; a bright head with a short fading diagonal trail living at most about one second. The treeline is a jagged band 2 to 4 cells tall on the horizon, glyphs "^" and "#" in colour (2,10,6), conifer shapes of varying heights.

R5, lake reflection: lake rows mirror the sky about the horizon with vertical compression toward the horizon line; reflected brightness scaled by REFLECT_SCALE = 0.55 defined in assets/aurora.js; colours from the same AURORA_STOPS; per row horizontal sine wobble of at most 2 cells plus per cell shimmer dimming; the treeline has no reflection.

R6, HUD and controls: one small dark translucent monospace HUD block in a top corner with four measured live readouts: FPS (averaged over the last 30 frames), LETTERS (non space glyphs drawn in the last frame), AURORA (effective activity, whole percent), ELAPSED (mm:ss). Element ids hud-fps, hud-letters, hud-activity, hud-elapsed; values update at least twice per second. Three controls in one row of dark translucent chips at the top, never covering the horizon: a Sound toggle button (id sound-toggle, labelled "Sound: Off" / "Sound: On"), an Activity slider (id activity-slider, labelled Activity, base activity 10 to 100, immediate effect), and a Pause/Play button (id pause-toggle) freezing and resuming the animation completely. Real button and input elements, visible labels and focus states, touch and keyboard usable. The page exposes window.__asciiAurora with live fields fps, letters, activity, audioState ("off" or "on") and elapsedSeconds.

R7, composition and attribution: only the canvas, the HUD, the controls row, a small title reading "ASCII Aurora", and exactly one footer line at the very bottom reading "Made with ANVIL, an open source software factory." as a link to https://anvil-landing-7x1.pages.dev, sitting over the darkest part of the lake and never covering the horizon. No other visible copy, no images, no other links.

R8, music: assets/audio.js synthesises an original ambient soundtrack entirely with WebAudio: no audio files, no samples, no streamed media, no copyrighted material. The AudioContext is created only inside the Sound toggle handler (no sound before a user gesture); toggling off suspends or closes it and returns audioState to "off". Generative score: pad chords from detuned oscillators through a lowpass filter, roots A2 110.00 Hz, F2 87.31 Hz, C3 130.81 Hz, G2 98.00 Hz, each held about 8 seconds with crossfades; sparse bell tones from the A minor pentatonic scale (A, C, D, E, G) in octaves 4 and 5, sine plus harmonic with exponential decay, every 2.5 to 6 seconds; a feedback delay (0.45 seconds, feedback 0.35) for the liminal space. Master gain at or below 0.2. Music and animation never start or stop each other.

R9, verification: tools/verify.mjs (plain node) asserting exactly the spec's R9 list, exiting non zero at the first failure. Its dash scan covers the authored files by explicit list only and explicitly excludes runs/, .anvil-factory/, node_modules/, dist/, .git/, evidence/ and any harness written packet wherever it lives. Its external reference check permits exactly one https reference in index.html, the attribution href, and none under assets/.

R10, evidence: tools/shots.mjs serving dist/ and capturing with playwright-core and the system Chrome named by the CHROME environment variable: evidence/stills/page-desktop.png (1280x800), evidence/stills/page-mobile.png (390x844), evidence/stills/page-sound.png (1280x800, after clicking the Sound toggle), each after at least 4 seconds of warm up, plus evidence/captures.json recording per capture the viewport, page title, horizontal overflow, aurora colour family fraction in the top half, non black fraction in the bottom half, and the window.__asciiAurora QA state (sampled twice one second apart on the desktop capture). If Chrome cannot run, record the captures NOT RUN in the builder report with the tool error quoted verbatim; never fabricate a capture.

R11, attribution: the R7 footer is required and is the standing attribution the project owner ordered for every ANVIL built project; README.md is operator authored and stays untouched. The dwcminh.ascii inspiration credit lives in the README and brain/project.md, not on the page.

Scenario accounting, required in the builder report: the builder report (runs/wo-gh-1/builder.output.md) must carry a line beginning "Base pin" carrying the full factory base pin 4675a131eb9aa88097741dc3cdc9772c3db17550, a scenario table with one line per scenario S1, S2, S3, S4, S5, S6, S7 marked RUN or NOT RUN, the evidence file names evidence/stills/page-desktop.png, evidence/stills/page-mobile.png, evidence/stills/page-sound.png and evidence/captures.json, the palette check result carrying the literal 74,222,128, the attribution literal "Made with ANVIL, an open source software factory." with its link https://anvil-landing-7x1.pages.dev, and the build's dist size line. The work order declares required_literals for these strings; a report missing any of them fails the checks gate by design.

Calibration note: max_run_tokens is 3500000 in anvil.yaml for this project. Basis: Doom Fire wo-gh-2, a one page order of the same shape carrying capture evidence, measured 3,106,260 tokens under a 3,500,000 cap and completed its build with counted reviews on its second attempt; OntoBrain wo-gh-1, an approved full gate run on this factory, measured 2,373,123 tokens total with a largest station of 856,156. A 3,500,000 cap leaves headroom above every single station measured on comparable page orders and matches the figure prescribed for this order. max_packet_tokens 48000 and max_runtime_turns 40 are the proven project values carried from doom-fire.

Authorised surface: index.html, assets/, build.mjs, package.json, package-lock.json, tools/verify.mjs, tools/shots.mjs, design/, tests/, evidence/, and the run's own records under runs/. Protected and never edited: anvil.json, anvil.yaml, .github/, .openspec/, brain/, work-orders/, tools/dispatch_station.py, tools/claude_station.py, README.md, LICENSE, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, .gitignore, BLUEPRINT.md, PIPELINES.md, status/, OPERATOR-NOTES.md.

Guardrails: no new npm dependencies beyond playwright-core as a devDependency; the build stays npm install then npm run build; the checks in anvil.json run without a GPU; rendered captures are evidence, never a check; no em dash or en dash character in any produced authored file; each reviewer writes its review to the authoritative review file named in its packet, and prose outside that file is not a review. This run merges nothing and deploys nothing; the result stops at the human gate.

GitHub issue: https://github.com/arananet/ascii-aurora/issues/1
- risk_hints: 
- status: new

## Upstream steps

- intake: failed
- spec-writer: failed
- test-writer: failed
- builder: failed
- checks-gate: failed
- loopback: loopback
- builder: failed
- checks-gate: failed
- loopback: loopback

## Run context

Read the upstream work before you start; it is the input your station builds on.
The checks gate runs the project checks listed here; run them yourself before you hand off.

- Spec for this order: .openspec/specs/ascii-aurora/spec.md
- Project check: `npm install --no-audit --no-fund && npm run build`
- Project check: `node tools/verify.mjs`

## Loopback feedback (attempt 3 of 3)

The previous attempt was sent back by checks-gate to builder. Resolve every finding below. Keep what already passed; do not start over.

Reason: Gate checks failed; artifact validation: Builder report artifact runs/wo-gh-1/builder.output.md is missing. Required literal not found in full in the builder report: 4675a131eb9aa88097741dc3cdc9772c3db17550 Required literal not found in full in the builder report: Base pin

- # Checks Gate: pre-review
  Basis: builder_delta
  Attempt: 2
  
  # Check Commands
  ## Command 1: npm install --no-audit --no-fund && npm run build
  Exit code: 254
  Output:
  ```
  npm error code ENOENT
  npm error syscall open
  npm error path /home/runner/work/ascii-aurora/ascii-aurora/package.json
  npm error errno -2
  npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/home/runner/work/ascii-aurora/ascii-aurora/package.json'
  npm error enoent This is related to npm not being able to find a file.
  npm error enoent
  npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-11-20T06_12_51_759Z-debug-0.log
  
  ```
  
  ## Command 2: node tools/verify.mjs
  Exit code: 1
  Output:
  ```
  node:internal/modules/cjs/loader:1433
    throw err;
    ^
  
  Error: Cannot find module '/home/runner/work/ascii-aurora/ascii-aurora/tools/verify.mjs'
      at Function._resolveFilename (node:internal/modules/cjs/loader:1430:15)
      at defaultResolveImpl (node:internal/modules/cjs/loader:1040:19)
      at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1045:22)
      at Function._load (node:internal/modules/cjs/loader:1216:25)
      at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
      at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
      at node:internal/main/run_main_module:36:49 {
    code: 'MODULE_NOT_FOUND',
    requireStack: []
  }
  
  Node.js v22.23.4
  
  ```

## Output contract

Write your builder report as a file to runs/wo-gh-1/builder.output.md. The checks gate reads that file back from the run tree before any reviewer runs; your chat reply is never accepted as the report.

The report must contain each of these literals in full, exactly as written (no abbreviation, no ellipsis):

- 4675a131eb9aa88097741dc3cdc9772c3db17550
- Base pin
- ASCII Aurora
- Made with ANVIL, an open source software factory.
- https://anvil-landing-7x1.pages.dev
- 74,222,128
- S1
- S2
- S3
- S4
- S5
- S6
- S7
- evidence/stills/page-desktop.png
- evidence/stills/page-mobile.png
- evidence/stills/page-sound.png
- evidence/captures.json
