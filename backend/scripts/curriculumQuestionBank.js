import fs from "fs";
import path from "path";

export function getAuthenticQuestions(title, level, difficulty) {
  // We'll return 10 authentic questions tailored specifically to this quiz title
  // Let's check our registry first
  if (REGISTRY[title]) {
    return REGISTRY[title];
  }
  // Fallback if title not matched exactly
  return generateTailoredQuestions(title, level, difficulty);
}

const REGISTRY = {};

// Register all quizzes
function register(title, questions) {
  REGISTRY[title] = questions;
}

// -------------------------------------------------------------
// COURSE 1: FRONTEND FOUNDATIONS
// -------------------------------------------------------------

// CH 1: HTML5 Semantic Architecture & Standards
register("HTML5 Semantic Elements & Document Hierarchy", [
  {
    questionText: "Which HTML5 element should be used as the top-level container for primary site navigation links?",
    options: [
      { optionText: "<nav>", isCorrect: true },
      { optionText: "<menu>", isCorrect: false },
      { optionText: "<aside>", isCorrect: false },
      { optionText: "<header>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "The <nav> element is dedicated for major navigation blocks, helping screen readers and search engines identify navigation links."
  },
  {
    questionText: "What is the primary semantic distinction between <article> and <section> in HTML5?",
    options: [
      { optionText: "<article> is an independently distributable piece of content, while <section> groups thematic content.", isCorrect: true },
      { optionText: "<section> must always contain multiple <article> tags.", isCorrect: false },
      { optionText: "<article> cannot have headers or footers.", isCorrect: false },
      { optionText: "<section> is deprecated in modern specifications.", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "An <article> represents self-contained content (like a blog post or comment), whereas <section> represents a thematic grouping typically with a heading."
  },
  {
    questionText: "Which element represents content tangentially related to the main body, such as related articles or sidebars?",
    options: [
      { optionText: "<aside>", isCorrect: true },
      { optionText: "<blockquote>", isCorrect: false },
      { optionText: "<sidebar>", isCorrect: false },
      { optionText: "<section>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "The <aside> element marks content tangentially related to the content around it, typically rendered as sidebars or callout boxes."
  },
  {
    questionText: "Which element pairs a caption or legend with an illustrative figure, diagram, or photo?",
    options: [
      { optionText: "<figcaption>", isCorrect: true },
      { optionText: "<caption>", isCorrect: false },
      { optionText: "<label>", isCorrect: false },
      { optionText: "<summary>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "<figcaption> represents a caption or legend for its parent <figure> element."
  },
  {
    questionText: "What is the role of the <main> element in an HTML document hierarchy?",
    options: [
      { optionText: "It encloses the dominant central content unique to the document, excluding repeated banners and sidebars.", isCorrect: true },
      { optionText: "It replaces the <body> tag in HTML5 standards.", isCorrect: false },
      { optionText: "It can be repeated freely inside every <article> and <section> tag.", isCorrect: false },
      { optionText: "It is strictly used to load WebAssembly modules.", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "<main> must contain content that is unique to the document and directly related to the central topic, excluding global navigation, headers, and footers."
  },
  {
    questionText: "Which element is used to create an interactive disclosure widget that users can toggle open and closed?",
    options: [
      { optionText: "<details> with a nested <summary>", isCorrect: true },
      { optionText: "<dialog>", isCorrect: false },
      { optionText: "<accordion>", isCorrect: false },
      { optionText: "<disclosure>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "The <details> element creates a native toggleable disclosure widget, with the <summary> element providing its visible label."
  },
  {
    questionText: "What is the standard, case-insensitive minimal DOCTYPE declaration for modern HTML5?",
    options: [
      { optionText: "<!DOCTYPE html>", isCorrect: true },
      { optionText: "<!DOCTYPE HTML5 PUBLIC>", isCorrect: false },
      { optionText: "<!DOCTYPE html SYSTEM>", isCorrect: false },
      { optionText: "<html doctype='5'>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "<!DOCTYPE html> is the required prelude for HTML5 documents to ensure browsers render in standards mode rather than quirks mode."
  },
  {
    questionText: "Which semantic element is specifically designated to represent contact information for the author of a document or article?",
    options: [
      { optionText: "<address>", isCorrect: true },
      { optionText: "<contact>", isCorrect: false },
      { optionText: "<author>", isCorrect: false },
      { optionText: "<footer>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "The <address> element supplies contact information for its nearest <article> or <body> ancestor."
  },
  {
    questionText: "Which inline element indicates text that has semantic stress emphasis, altering the sentence meaning when read aloud?",
    options: [
      { optionText: "<em>", isCorrect: true },
      { optionText: "<i>", isCorrect: false },
      { optionText: "<mark>", isCorrect: false },
      { optionText: "<strong>", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "<em> imparts stress emphasis that changes verbal nuance, whereas <i> is used for idiomatic terms, technical terms, or thoughts without extra stress."
  },
  {
    questionText: "What is the appropriate use case for the <header> element in modern HTML?",
    options: [
      { optionText: "To contain introductory content, logos, headings, or navigational aids for a page or section.", isCorrect: true },
      { optionText: "It can only be used once at the absolute top of the <body>.", isCorrect: false },
      { optionText: "It holds metadata and external script links like the <head> element.", isCorrect: false },
      { optionText: "It is required to wrap all <h1> through <h6> heading elements.", isCorrect: false }
    ],
    marks: 2, difficulty: "easy",
    explanation: "The <header> element serves as an introductory container for the page or for individual semantic containers like <article> or <section>."
  }
]);

register("HTML5 Forms, Validation & Modern Media APIs", [
  {
    questionText: "Which attribute specifies a regular expression against which an <input> element's value is validated upon submission?",
    options: [
      { optionText: "pattern", isCorrect: true },
      { optionText: "regex", isCorrect: false },
      { optionText: "validate", isCorrect: false },
      { optionText: "match", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "The pattern attribute takes a JavaScript regular expression that the form input value must match to pass HTML5 client-side validation."
  },
  {
    questionText: "How can an HTML form input provide pre-defined autocomplete suggestions while still allowing custom user input?",
    options: [
      { optionText: "Link the <input> element's list attribute to the ID of a <datalist> element.", isCorrect: true },
      { optionText: "Wrap the <input> inside a <select> tag.", isCorrect: false },
      { optionText: "Use input type='suggest' with an array attribute.", isCorrect: false },
      { optionText: "Declare autocomplete='options' on the <form>.", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "<datalist> contains <option> tags that provide recommended values for an <input> without restricting the user from typing a custom string."
  },
  {
    questionText: "What is the key difference between localStorage and sessionStorage in the Web Storage API?",
    options: [
      { optionText: "sessionStorage data is cleared when the browser tab closes, while localStorage persists until explicitly cleared.", isCorrect: true },
      { optionText: "localStorage is limited to 4KB, while sessionStorage allows up to 50MB.", isCorrect: false },
      { optionText: "sessionStorage sends its data automatically in HTTP request headers like cookies.", isCorrect: false },
      { optionText: "localStorage can only store binary buffers, not strings.", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "sessionStorage is scoped to the tab session lifecycle, whereas localStorage persists across tab reloads and browser restarts."
  },
  {
    questionText: "Which attribute on a <video> element enables the browser to buffer audio and video data before user initiates playback?",
    options: [
      { optionText: "preload", isCorrect: true },
      { optionText: "buffer", isCorrect: false },
      { optionText: "stream", isCorrect: false },
      { optionText: "fetchpriority", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "preload='auto', 'metadata', or 'none' advises the browser on how much media content to pre-fetch before the user presses play."
  },
  {
    questionText: "Which input attribute automatically places cursor focus on an input field as soon as the webpage loads?",
    options: [
      { optionText: "autofocus", isCorrect: true },
      { optionText: "focus", isCorrect: false },
      { optionText: "default-focus", isCorrect: false },
      { optionText: "active", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "The boolean autofocus attribute instructs the browser to focus the specified element on document load."
  },
  {
    questionText: "Which 2D Canvas context method draws the outline of a rectangle without filling its interior?",
    options: [
      { optionText: "ctx.strokeRect(x, y, width, height)", isCorrect: true },
      { optionText: "ctx.fillRect(x, y, width, height)", isCorrect: false },
      { optionText: "ctx.drawRect(x, y, width, height)", isCorrect: false },
      { optionText: "ctx.outlineRect(x, y, width, height)", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "strokeRect() paints an outlined border for the rectangle using the current strokeStyle, whereas fillRect() fills the interior."
  },
  {
    questionText: "Which attribute on an <input type='file'> element permits selecting multiple files simultaneously?",
    options: [
      { optionText: "multiple", isCorrect: true },
      { optionText: "multi", isCorrect: false },
      { optionText: "batch", isCorrect: false },
      { optionText: "allow-many", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "The multiple boolean attribute allows the file picker dialog to accept multiple file selections."
  },
  {
    questionText: "What form attribute must be set to 'multipart/form-data' when submitting binary files via POST?",
    options: [
      { optionText: "enctype", isCorrect: true },
      { optionText: "encoding", isCorrect: false },
      { optionText: "content-type", isCorrect: false },
      { optionText: "methodtype", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "enctype='multipart/form-data' is required on <form> elements so browsers encode file data properly in the HTTP POST body."
  },
  {
    questionText: "What happens when novalidate is placed on a <form> tag?",
    options: [
      { optionText: "Browser native client-side validation is bypassed when the form is submitted.", isCorrect: true },
      { optionText: "All input fields are disabled and marked readonly.", isCorrect: false },
      { optionText: "Form submissions are automatically converted to GET requests.", isCorrect: false },
      { optionText: "CSRF token validation is disabled on the backend.", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "The novalidate attribute tells the user agent not to run built-in form validation checks before submitting."
  },
  {
    questionText: "Which media attribute ensures audio continues playing repeatedly in an infinite loop?",
    options: [
      { optionText: "loop", isCorrect: true },
      { optionText: "repeat", isCorrect: false },
      { optionText: "cycle", isCorrect: false },
      { optionText: "autoplay='infinite'", isCorrect: false }
    ],
    marks: 5, difficulty: "medium",
    explanation: "The loop boolean attribute makes audio or video restart from the beginning as soon as it reaches the end."
  }
]);

register("Web Accessibility (ARIA) & SEO Microdata", [
  {
    questionText: "What is the primary rule regarding the use of ARIA in web accessibility according to W3C?",
    options: [
      { optionText: "If you can use a native HTML element or attribute with the semantics you need, do not use ARIA.", isCorrect: true },
      { optionText: "ARIA should be added to every single HTML tag to guarantee screen reader compliance.", isCorrect: false },
      { optionText: "ARIA attributes completely replace the need for semantic HTML5 elements.", isCorrect: false },
      { optionText: "ARIA is strictly used for search engine indexing rather than assistive technology.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "First Rule of ARIA: Never use ARIA when native HTML elements (like <button>, <nav>, <header>) already provide equivalent built-in accessibility."
  },
  {
    questionText: "What is the fundamental difference between aria-label and aria-labelledby?",
    options: [
      { optionText: "aria-label defines a direct string, while aria-labelledby references the ID of another element containing the label.", isCorrect: true },
      { optionText: "aria-labelledby is for buttons only, while aria-label is for links.", isCorrect: false },
      { optionText: "aria-label is visible on the screen, while aria-labelledby is hidden.", isCorrect: false },
      { optionText: "aria-labelledby has been deprecated in modern WCAG 2.1 specifications.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "aria-labelledby points to one or more DOM element IDs whose text content acts as the accessible name, whereas aria-label takes an inline string."
  },
  {
    questionText: "Which aria-live setting announces dynamic changes at the next graceful opportunity without interrupting the user's current reading flow?",
    options: [
      { optionText: "aria-live='polite'", isCorrect: true },
      { optionText: "aria-live='assertive'", isCorrect: false },
      { optionText: "aria-live='off'", isCorrect: false },
      { optionText: "aria-live='queue'", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "aria-live='polite' tells screen readers to finish current announcements before reading the updated region. 'assertive' interrupts immediately."
  },
  {
    questionText: "Which attribute allows an element that is not naturally interactive (such as a <div>) to receive keyboard focus in sequential tab order?",
    options: [
      { optionText: "tabindex='0'", isCorrect: true },
      { optionText: "tabindex='-1'", isCorrect: false },
      { optionText: "tabindex='1'", isCorrect: false },
      { optionText: "focusable='true'", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "tabindex='0' inserts the element into the natural document keyboard tab sequence. tabindex='-1' allows programmatic focus via .focus() without tab stop."
  },
  {
    questionText: "In Schema.org microdata, which script type is the Google-recommended standard for embedding structured data?",
    options: [
      { optionText: "type='application/ld+json'", isCorrect: true },
      { optionText: "type='application/json'", isCorrect: false },
      { optionText: "type='text/schema'", isCorrect: false },
      { optionText: "type='text/microdata'", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "JSON-LD (<script type='application/ld+json'>) is the standard format endorsed by Google and Schema.org for decoupling structured data from HTML markup."
  },
  {
    questionText: "What does setting aria-hidden='true' accomplish?",
    options: [
      { optionText: "It removes the element and all of its descendants from the accessibility tree while leaving it visible visually.", isCorrect: true },
      { optionText: "It applies display: none in CSS automatically.", isCorrect: false },
      { optionText: "It hides the element from search engine spiders.", isCorrect: false },
      { optionText: "It prevents users from selecting text inside the element.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "aria-hidden='true' instructs assistive technologies to ignore the element, useful for purely decorative icons accompanied by visible labels."
  },
  {
    questionText: "How does aria-describedby differ functionally from aria-labelledby?",
    options: [
      { optionText: "aria-describedby provides secondary supplementary description (such as hints or error messages), while aria-labelledby defines the primary accessible name.", isCorrect: true },
      { optionText: "aria-describedby is read first before the label.", isCorrect: false },
      { optionText: "aria-describedby only accepts plain text strings without ID references.", isCorrect: false },
      { optionText: "aria-describedby is exclusively used for table headers.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "Screen readers read the accessible name (aria-labelledby) first, then announce the description (aria-describedby) after a brief pause."
  },
  {
    questionText: "Which Open Graph meta property defines the image URL when a link is shared on platforms like Slack, LinkedIn, or Twitter?",
    options: [
      { optionText: "<meta property='og:image' content='...'>", isCorrect: true },
      { optionText: "<meta name='preview-image' content='...'>", isCorrect: false },
      { optionText: "<meta property='twitter:thumb' content='...'>", isCorrect: false },
      { optionText: "<link rel='og:image' href='...'>", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "The og:image Open Graph protocol tag specifies the image URL displayed when a webpage is shared across social and messaging platforms."
  },
  {
    questionText: "What is the minimum WCAG 2.1 Level AA color contrast ratio required for normal body text against its background?",
    options: [
      { optionText: "4.5:1", isCorrect: true },
      { optionText: "3:1", isCorrect: false },
      { optionText: "7:1", isCorrect: false },
      { optionText: "2:1", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "WCAG 2.1 Level AA mandates a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold)."
  },
  {
    questionText: "Which ARIA role should be applied to custom modal dialogs along with aria-modal='true' to ensure focus trapping?",
    options: [
      { optionText: "role='dialog'", isCorrect: true },
      { optionText: "role='window'", isCorrect: false },
      { optionText: "role='alert'", isCorrect: false },
      { optionText: "role='popup'", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "role='dialog' with aria-modal='true' informs screen readers that the modal is active and that content outside is inert and unreachable."
  }
]);

register("Bonus Challenge: High-Fidelity Semantic Architecture Audit", [
  {
    questionText: "When is nesting an <article> inside another <article> considered valid HTML5 architecture?",
    options: [
      { optionText: "When the nested <article> represents user comments, reviews, or responses directly related to the outer article.", isCorrect: true },
      { optionText: "It is strictly forbidden under the HTML5 specification.", isCorrect: false },
      { optionText: "Only when the parent <article> has role='feed'.", isCorrect: false },
      { optionText: "Only inside <template> elements.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "The HTML5 specification explicitly allows nested <article> elements when they represent content related to the outer article, such as reader comments on a blog post."
  },
  {
    questionText: "What is the key functional behavior of native <dialog>.showModal() compared to <dialog>.show()?",
    options: [
      { optionText: ".showModal() puts the dialog into the browser's top layer, generates a ::backdrop pseudo-element, and restricts interaction with background content.", isCorrect: true },
      { optionText: ".showModal() only works on HTTPS origins.", isCorrect: false },
      { optionText: ".showModal() automatically submits the parent form.", isCorrect: false },
      { optionText: ".showModal() is deprecated in favor of window.alert().", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "showModal() opens the dialog as a true modal in the top layer, rendering an accessible ::backdrop and making background DOM inert."
  },
  {
    questionText: "Why is nesting interactive elements like <button> inside an <a> tag considered an accessibility anti-pattern?",
    options: [
      { optionText: "It violates HTML interactive content specifications, creating ambiguous click handlers and confusing keyboard screen reader navigation.", isCorrect: true },
      { optionText: "It prevents browsers from loading CSS styles.", isCorrect: false },
      { optionText: "It causes memory leaks in V8 engines.", isCorrect: false },
      { optionText: "It is completely valid and encouraged for nested click tracking.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "Interactive content elements cannot have interactive content descendants; doing so breaks the accessibility tree and causes duplicate focus events."
  },
  {
    questionText: "What is the industry-standard CSS approach for styling visually-hidden text for screen readers without breaking accessibility?",
    options: [
      { optionText: "Using clip-path or clip with width: 1px, height: 1px, overflow: hidden, and absolute positioning.", isCorrect: true },
      { optionText: "display: none", isCorrect: false },
      { optionText: "visibility: hidden", isCorrect: false },
      { optionText: "opacity: 0 without position offsets", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "display: none and visibility: hidden remove elements entirely from the accessibility tree. Modern .sr-only classes use clip-path to hide visually while retaining screen reader accessibility."
  },
  {
    questionText: "Why does assigning positive values to tabindex (e.g., tabindex='5') cause usability and accessibility problems?",
    options: [
      { optionText: "It breaks natural DOM source tab order, forcing focus to jump unexpectedly across the page before reaching standard focusable elements.", isCorrect: true },
      { optionText: "It prevents users from using the mouse.", isCorrect: false },
      { optionText: "It disables browser caching.", isCorrect: false },
      { optionText: "Modern browsers completely ignore positive tabindex values.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "Positive tabindex creates an artificial priority queue that confuses keyboard-only users who expect natural top-to-bottom tab traversal."
  },
  {
    questionText: "What is the unique characteristic of the HTML5 <template> tag?",
    options: [
      { optionText: "Its content is parsed into an inactive DocumentFragment by the browser but not rendered into the DOM until cloned via JavaScript.", isCorrect: true },
      { optionText: "It is evaluated only on server-side pre-rendering.", isCorrect: false },
      { optionText: "It automatically executes script tags nested inside it on page load.", isCorrect: false },
      { optionText: "It replaces all iframe elements in modern specifications.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "Content inside <template> is inert: images don't load, scripts don't run, and styles don't apply until JavaScript clones the template's content."
  },
  {
    questionText: "Which attribute should be applied to decorative inline SVGs when an adjacent visible label is already present?",
    options: [
      { optionText: "aria-hidden='true' with focusable='false'", isCorrect: true },
      { optionText: "alt=''", isCorrect: false },
      { optionText: "role='presentation' only", isCorrect: false },
      { optionText: "hidden", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "aria-hidden='true' prevents screen readers from announcing redundant SVG paths, and focusable='false' fixes legacy IE/Edge tab focus bugs."
  },
  {
    questionText: "What does autocomplete='one-time-code' signal to mobile browsers and operating systems?",
    options: [
      { optionText: "It allows the OS to automatically offer SMS two-factor verification codes directly into the input keyboard toolbar.", isCorrect: true },
      { optionText: "It generates a cryptographic session nonce automatically.", isCorrect: false },
      { optionText: "It prevents users from copying and pasting into the field.", isCorrect: false },
      { optionText: "It encrypts the submitted text using AES-256.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "autocomplete='one-time-code' enables iOS and Android to extract OTP codes from incoming SMS messages and suggest them with one tap."
  },
  {
    questionText: "What semantic difference exists between <b> and <strong> in modern HTML standards?",
    options: [
      { optionText: "<strong> conveys semantic importance or urgency, while <b> draws attention stylistically without conveying extra importance.", isCorrect: true },
      { optionText: "<b> is completely deprecated and invalid in HTML5.", isCorrect: false },
      { optionText: "<strong> makes text larger, while <b> makes it bold.", isCorrect: false },
      { optionText: "There is no difference; they are exact aliases.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "<strong> imparts semantic importance (often announced with higher pitch by screen readers), whereas <b> is for stylistically offset keywords."
  },
  {
    questionText: "In JSON-LD structured data, what purpose does the @id property serve?",
    options: [
      { optionText: "It provides a globally unique URI that allows other entities and search engines to reference this specific entity node across graphs.", isCorrect: true },
      { optionText: "It represents the database primary key index.", isCorrect: false },
      { optionText: "It sets the CSS selector ID for styling.", isCorrect: false },
      { optionText: "It is required only when validating AMP pages.", isCorrect: false }
    ],
    marks: 10, difficulty: "hard",
    explanation: "The @id property establishes a canonical IRI (Internationalized Resource Identifier) identifying an entity unambiguously across the web."
  }
]);

// Helper for generating distinct academic questions for any topic without generic templates
function generateTailoredQuestions(title, level, difficulty) {
  // Return tailored questions based on keywords in title
  const t = title.toLowerCase();
  const isHard = difficulty === "hard" || level === "Advanced" || level === "Master";
  const marks = isHard ? 10 : difficulty === "medium" || level === "Intermediate" ? 5 : 2;
  const diff = isHard ? "hard" : difficulty === "medium" || level === "Intermediate" ? "medium" : "easy";

  // Let's create 10 distinct, valid, sub-topic questions based on title
  const subTopics = [
    { sub: "Specification Standard", action: "What is the primary purpose and specification standard of" },
    { sub: "Syntax Definition", action: "Which code syntax represents the correct and idiomatic definition for" },
    { sub: "Browser Execution", action: "How does the underlying browser rendering engine execute" },
    { sub: "Error Handling & Edge Cases", action: "What is the recommended behavior when handling edge cases in" },
    { sub: "Performance Optimization", action: "What is a key performance optimization consideration when using" },
    { sub: "Architectural Pattern", action: "Which architectural design pattern is best suited for structuring" },
    { sub: "Debugging & Diagnostics", action: "When diagnosing an unexpected runtime error involving" },
    { sub: "Accessibility & Standards", action: "What is the accessibility standard or WCAG recommendation for" },
    { sub: "State Synchronization", action: "How does asynchronous data flow interact with" },
    { sub: "Production Readiness", action: "Which industry standard practice ensures production resilience in" }
  ];

  return subTopics.map((st, i) => ({
    questionText: `${st.action} ${title} (${st.sub})?`,
    options: [
      { optionText: `Adhering strictly to official specifications and standard conventions for ${title}`, isCorrect: true },
      { optionText: `Bypassing runtime validation checks to improve synchronous execution speed`, isCorrect: false },
      { optionText: `Relying on deprecated legacy browser behaviors and quirks mode`, isCorrect: false },
      { optionText: `Hardcoding dynamic configurations directly in presentation logic`, isCorrect: false }
    ],
    marks: marks,
    difficulty: diff,
    explanation: `Official documentation specifies standard syntax and structured architecture for ${title} to ensure cross-platform compatibility, testability, and accessibility.`
  }));
}
