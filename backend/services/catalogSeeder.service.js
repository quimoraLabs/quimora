import mongoose from "mongoose";
import User from "../models/user.model.js";
import Interest from "../models/interest.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAssignment from "../models/quizAssignment.model.js";
import { redisCache } from "../config/redis.js";

// Helper to generate 15 realistic questions per quiz
function createQuestions(quizName, questionsData) {
  return questionsData.map((q, idx) => ({
    questionText: q.q,
    options: q.opts.map((text, i) => ({
      optionText: text,
      isCorrect: i === q.correct,
    })),
    marks: 2,
    difficulty: idx < 5 ? "easy" : idx < 11 ? "medium" : "hard",
    eloRating: 950 + idx * 30,
  }));
}

export const QUIZZES_CATALOG = [
  // ==========================================
  // TOPIC 1: Web Foundations (HTML, CSS, JS)
  // Provides individual dedicated choices for HTML, CSS, and JS!
  // ==========================================
  {
    slug: "web-foundations",
    subtopic: "HTML",
    title: "HTML5 Semantic Structure & Modern Web Standards",
    description: "Deep dive into HTML5 semantic elements, accessibility (a11y), form validation, and SEO best practices.",
    timeLimit: 15,
    tags: ["html", "html5", "semantic-html", "accessibility", "frontend"],
    questions: [
      { q: "Which semantic tag represents content tangentially related to the main content?", opts: ["<aside>", "<section>", "<article>", "<nav>"], correct: 0 },
      { q: "What does the 'loading=lazy' attribute on an <img> tag do?", opts: ["Defers loading until image is near the viewport", "Compresses image bytes on upload", "Forces browser to preload image immediately", "Renders low-resolution placeholder"], correct: 0 },
      { q: "Which HTML5 attribute enforces an input field to accept only valid email patterns?", opts: ["type='email'", "pattern='email'", "validate='true'", "inputmode='mail'"], correct: 0 },
      { q: "What is the primary role of the <main> landmark element?", opts: ["Contains dominant content unique to the document", "Wraps the site header and navigation", "Defines the website footer links", "Houses global stylesheet links"], correct: 0 },
      { q: "Which HTML attribute specifies alternate text for screen readers when an image fails to load?", opts: ["alt", "title", "caption", "aria-hidden"], correct: 0 },
      { q: "What is the purpose of the <meta name='viewport'> tag in responsive web design?", opts: ["Controls layout viewport scaling on mobile devices", "Downloads mobile-optimized fonts", "Redirects mobile users to m.example.com", "Speeds up browser rendering pipeline"], correct: 0 },
      { q: "Which element should wrap each logical tab or independent distributable block of content (like a blog post)?", opts: ["<article>", "<div>", "<summary>", "<details>"], correct: 0 },
      { q: "What does the 'autocomplete' attribute on <form> elements achieve?", opts: ["Instructs browsers whether to predict user input", "Submits the form automatically after 5 seconds", "Validates input without server roundtrips", "Stores input directly in localStorage"], correct: 0 },
      { q: "Which element provides an interactive dropdown disclosing extra information when clicked?", opts: ["<details> and <summary>", "<dialog> and <popup>", "<dropdown> and <menu>", "<select> and <option>"], correct: 0 },
      { q: "In HTML5, which tag natively defines subtitles or captions for <video> content?", opts: ["<track>", "<caption-track>", "<subtitles>", "<audio>"], correct: 0 },
      { q: "What role does the 'aria-live' attribute serve in dynamic single-page applications?", opts: ["Announces real-time DOM changes to screen readers", "Enables WebSockets over HTTPS", "Animates HTML elements with keyframes", "Optimizes garbage collection for nodes"], correct: 0 },
      { q: "Which HTTP header is complemented by the HTML tag <meta http-equiv='Content-Security-Policy'>?", opts: ["CSP security policy enforcement", "CORS origin validation", "GZIP compression header", "Cache-Control max-age header"], correct: 0 },
      { q: "What is the valid DOCTYPE declaration for all modern HTML5 documents?", opts: ["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<!DOCTYPE xhtml-strict>", "<!HTML PUBLIC 'modern'>"], correct: 0 },
      { q: "Which attribute opens an anchor link in a new browser tab safely when combined with rel='noopener'?", opts: ["target='_blank'", "target='_new'", "open='tab'", "window='popup'"], correct: 0 },
      { q: "What is the key advantage of using <picture> with multiple <source> tags over a plain <img>?", opts: ["Art direction and format selection (WebP/AVIF)", "Automatic image compression on the server", "Direct hardware GPU acceleration", "Encryption of image assets"], correct: 0 },
    ]
  },
  {
    slug: "web-foundations",
    subtopic: "CSS",
    title: "CSS3 Flexbox, Grid & Responsive Layouts",
    description: "Master modern CSS layout architectures, multi-axis alignments, CSS Grid areas, and media queries.",
    timeLimit: 15,
    tags: ["css", "css3", "flexbox", "grid", "responsive-design"],
    questions: [
      { q: "Which CSS Flexbox property aligns flex items along the cross-axis?", opts: ["align-items", "justify-content", "flex-direction", "align-content"], correct: 0 },
      { q: "What does 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))' achieve?", opts: ["Creates an intrinsically responsive grid without media queries", "Forces exactly 4 equal-width columns", "Limits grid items to 250px maximum", "Positions grid rows vertically"], correct: 0 },
      { q: "What does 'box-sizing: border-box' change in the CSS box model calculation?", opts: ["Includes padding and border within width and height", "Adds margin into the element's width", "Removes borders on smaller screens", "Excludes content padding completely"], correct: 0 },
      { q: "In Flexbox, what is the default value of 'flex-direction'?", opts: ["row", "column", "row-reverse", "initial-flex"], correct: 0 },
      { q: "Which CSS property specifies the spacing between grid rows and columns without negative margins?", opts: ["gap", "space-between", "margin-collapse", "cell-padding"], correct: 0 },
      { q: "What is the difference between 'justify-content' and 'align-items' in a row flex container?", opts: ["justify-content aligns horizontally; align-items aligns vertically", "justify-content aligns vertically; align-items aligns horizontally", "They perform identical functions", "align-items only works on nested containers"], correct: 0 },
      { q: "Which unit in CSS is relative to the font-size of the root <html> element?", opts: ["rem", "em", "vh", "%"], correct: 0 },
      { q: "What does the 'fr' unit represent in CSS Grid Layout?", opts: ["A fraction of the available free space in the grid container", "Fixed resolution pixel ratio", "Frames per second for CSS transitions", "Font-relative baseline unit"], correct: 0 },
      { q: "How do you hide an element visually while keeping it fully accessible to screen readers?", opts: ["Use standard .sr-only clip/rect CSS utility", "display: none", "visibility: hidden", "opacity: 0"], correct: 0 },
      { q: "Which pseudo-class applies styles when an interactive element receives keyboard focus?", opts: [":focus-visible", ":active", ":hover", ":target"], correct: 0 },
      { q: "What does 'flex-shrink: 0' instruct a flex item to do?", opts: ["Prevents the item from shrinking when space is constrained", "Forces item to fill remaining space", "Shrinks the item to zero width", "Hides the item on mobile viewports"], correct: 0 },
      { q: "What is the specificity weight of an ID selector compared to a class selector?", opts: ["ID has higher specificity (1-0-0 vs 0-1-0)", "Class selector has higher specificity", "They have equal specificity weight", "Specificity depends solely on file load order"], correct: 0 },
      { q: "Which media query feature checks if the user's OS prefers dark color schemes?", opts: ["prefers-color-scheme: dark", "color-mode: dark", "theme: dark-preferred", "os-theme: dark"], correct: 0 },
      { q: "What does 'position: sticky' do when the element scrolls within its container?", opts: ["Behaves as relative until threshold is reached, then sticks", "Fixed permanently to the browser viewport", "Absolute positioned relative to body", "Static layout without scrolling"], correct: 0 },
      { q: "Which modern CSS function clamps a value between a minimum and maximum threshold?", opts: ["clamp(min, preferred, max)", "minmax(min, max)", "range(min, max)", "calc(min, max)"], correct: 0 },
    ]
  },
  {
    slug: "web-foundations",
    subtopic: "JavaScript",
    title: "Core JavaScript Fundamentals & ES6+ Syntax",
    description: "Deep dive into JS data structures, closures, lexical scoping, prototypes, and asynchronous execution.",
    timeLimit: 15,
    tags: ["javascript", "js", "es6", "async", "event-loop"],
    questions: [
      { q: "What is the primary difference between 'let' and 'var' declarations in JavaScript?", opts: ["'let' is block-scoped; 'var' is function-scoped", "'let' is hoisted to global window object", "'var' cannot be reassigned", "'let' creates immutable constants"], correct: 0 },
      { q: "What will 'typeof null' return in JavaScript?", opts: ["'object'", "'null'", "'undefined'", "'boolean'"], correct: 0 },
      { q: "Which method creates a shallow copy of an array with elements that pass a predicate test?", opts: ["Array.prototype.filter()", "Array.prototype.map()", "Array.prototype.forEach()", "Array.prototype.reduce()"], correct: 0 },
      { q: "What is a closure in JavaScript?", opts: ["A function bundled with references to its surrounding lexical environment", "A syntax for closing browser tabs", "A method to terminate event loops", "An immutable object freeze wrapper"], correct: 0 },
      { q: "What does the strict equality operator (===) check?", opts: ["Equality of both value and data type without type coercion", "Equality of value after converting types", "Object reference address equality only", "Whether both variables are truthy"], correct: 0 },
      { q: "What does 'Array.prototype.reduce()' return?", opts: ["A single accumulated value resulting from reducer execution", "Always an array of equal length", "A boolean flag indicating matching elements", "A promise resolving after iteration"], correct: 0 },
      { q: "How do Arrow Functions handle the 'this' keyword differently from regular functions?", opts: ["They retain 'this' lexically from enclosing scope", "They bind 'this' to the caller object automatically", "They throw TypeError if 'this' is accessed", "They always point 'this' to the global window"], correct: 0 },
      { q: "Which Promise method resolves only after ALL input promises have fulfilled or rejected?", opts: ["Promise.allSettled()", "Promise.all()", "Promise.race()", "Promise.any()"], correct: 0 },
      { q: "What happens when an unhandled rejection occurs in an async/await function?", opts: ["An UnhandledPromiseRejection error is raised", "The function returns undefined silently", "The browser window immediately reloads", "The promise converts to null"], correct: 0 },
      { q: "Which ES6 feature extracts properties from objects into distinct variables?", opts: ["Destructuring assignment", "Object reflection", "Property projection", "Spread aggregation"], correct: 0 },
      { q: "What is the JavaScript Event Loop responsible for?", opts: ["Coordinating call stack execution with callback/task queues", "Rendering CSS frames at 60fps", "Garbage collecting unused DOM nodes", "Compressing HTTP network payloads"], correct: 0 },
      { q: "What does 'Object.freeze(obj)' accomplish?", opts: ["Prevents adding, removing, or modifying properties of an object", "Creates a deep clone of the target object", "Converts object properties to JSON strings", "Encrypts object in browser memory"], correct: 0 },
      { q: "Which operator provides a default value only when the left operand is null or undefined?", opts: ["Nullish Coalescing (??)", "Logical OR (||)", "Ternary Operator (?:)", "Optional Chaining (?.)"], correct: 0 },
      { q: "What does 'setTimeout(fn, 0)' do in terms of the event loop?", opts: ["Queues the callback to run in the next macrotask iteration", "Executes synchronously before current call stack finishes", "Pauses JavaScript thread for 1 millisecond", "Spawns a new background Web Worker thread"], correct: 0 },
      { q: "How does JavaScript inherit properties and methods between objects?", opts: ["Through the prototype chain", "Through classical class copy inheritance", "Through virtual memory pointers", "Through HTTP socket streams"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 2: Modern Web & Frameworks
  // ==========================================
  {
    slug: "modern-web",
    subtopic: "React",
    title: "React Component Architecture & Hooks Mastery",
    description: "Deep dive into component lifecycle, custom hooks, reconciliation, memoization, and state synchronization.",
    timeLimit: 15,
    tags: ["react", "frontend", "hooks", "components"],
    questions: [
      { q: "What hook is used to perform side effects in functional React components?", opts: ["useEffect", "useState", "useMemo", "useRef"], correct: 0 },
      { q: "Why is a unique 'key' prop required when rendering dynamic lists in React?", opts: ["Helps Virtual DOM identify items for efficient reconciliation", "Sets the DOM element id attribute", "Triggers CSS enter animations", "Stores database primary keys in window"], correct: 0 },
      { q: "What does 'useMemo' hook return?", opts: ["A memoized computed value recalculated only when dependencies change", "A memoized callback function definition", "A mutable ref object persisting across renders", "A state setter function"], correct: 0 },
      { q: "What is the difference between 'useCallback' and 'useMemo'?", opts: ["useCallback memoizes functions; useMemo memoizes computed values", "useCallback runs on unmount; useMemo runs on mount", "They are identical aliases for the same function", "useMemo is only used for Redux stores"], correct: 0 },
      { q: "When does the cleanup function returned by 'useEffect' execute?", opts: ["Before component unmounts and before re-running the effect", "Immediately after DOM renders", "Only when an error occurs inside the effect", "Only once when the application boots"], correct: 0 },
      { q: "What does 'useRef' provide that state does not?", opts: ["A mutable container whose changes do NOT trigger a re-render", "Automatic caching in browser IndexedDB", "Encrypted variable storage across tabs", "Direct server-side rendering support"], correct: 0 },
      { q: "What is React Reconciliation?", opts: ["The algorithm React uses to diff Virtual DOM trees and update real DOM", "The process of authenticating JWT tokens", "Synchronizing local state with Redux backend", "Bundling JSX into minified JavaScript"], correct: 0 },
      { q: "In React 18, what is automatic batching?", opts: ["Grouping multiple state updates into a single re-render across all events", "Packaging images into WebP sprites", "Splitting code into vendor chunks", "Pre-rendering pages at build time"], correct: 0 },
      { q: "What is the primary role of React Context API?", opts: ["Sharing global state across component trees without prop drilling", "Handling server database migrations", "Managing WebGL animations", "Encrypting passwords before transmission"], correct: 0 },
      { q: "Which hook should be used for complex state logic involving multiple sub-values or actions?", opts: ["useReducer", "useState", "useLayoutEffect", "useImperativeHandle"], correct: 0 },
      { q: "What is a Pure Component in React terminology?", opts: ["A component that renders the same output for identical props and state", "A component that has no JSX markup", "A component written without JavaScript", "A component that connects directly to MongoDB"], correct: 0 },
      { q: "What happens if you update state inside a component render body directly?", opts: ["Triggers an infinite render loop error", "Updates the DOM synchronously without issue", "Silently ignores the update", "Causes browser memory compression"], correct: 0 },
      { q: "What is React Suspense used for?", opts: ["Declaratively handling loading states for asynchronous components/data", "Halting execution during runtime errors", "Throttling high-frequency mouse events", "Encrypting client cookies"], correct: 0 },
      { q: "Why should you never call React hooks conditionally inside if statements?", opts: ["React relies on consistent hook call order to maintain internal state", "Conditional hooks cause memory leaks in V8", "Hooks cannot read boolean expressions", "JavaScript syntax errors prevent compilation"], correct: 0 },
      { q: "What is the role of 'useId' hook introduced in React 18?", opts: ["Generating unique, SSR-safe accessibility IDs across client and server", "Fetching user profile IDs from authentication tokens", "Creating cryptographic UUIDs for database rows", "Validating form input element IDs"], correct: 0 },
    ]
  },
  {
    slug: "modern-web",
    subtopic: "Node.js",
    title: "Node.js, Express & REST API Architecture",
    description: "Build robust backend microservices: middleware pipelines, JWT auth, status codes, and error handlers.",
    timeLimit: 15,
    tags: ["node", "express", "backend", "api", "rest"],
    questions: [
      { q: "In Express.js, what does middleware function signature look like?", opts: ["(req, res, next) => { ... }", "(request, response) => { ... }", "(err, success) => { ... }", "(state, dispatch) => { ... }"], correct: 0 },
      { q: "Which HTTP status code indicates a successful resource creation?", opts: ["201 Created", "200 OK", "204 No Content", "304 Not Modified"], correct: 0 },
      { q: "What is the purpose of the 'next()' function in Express middleware?", opts: ["Passes control to the next middleware in the execution stack", "Sends the HTTP response to the client immediately", "Terminates the Node.js event loop process", "Restarts the HTTP server instance"], correct: 0 },
      { q: "Which HTTP status code represents unauthenticated requests lacking a valid token?", opts: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"], correct: 0 },
      { q: "What is the difference between 401 Unauthorized and 403 Forbidden?", opts: ["401 is for missing/invalid credentials; 403 is for authenticated but insufficient permissions", "401 is server error; 403 is client error", "They are identical and interchangeable", "401 is for GET requests; 403 is for POST requests"], correct: 0 },
      { q: "Which built-in Node.js module handles file system operations like reading and writing files?", opts: ["fs (or fs/promises)", "path", "http", "stream"], correct: 0 },
      { q: "What does CORS (Cross-Origin Resource Sharing) protect against?", opts: ["Unauthorized client-side cross-origin browser requests", "Server CPU overheating during spikes", "MongoDB database corruption", "SQL injection attacks in query strings"], correct: 0 },
      { q: "How should passwords be stored in a production database?", opts: ["Hashed with a salt using bcrypt or argon2", "Encrypted with Base64", "Stored in plaintext inside an encrypted disk", "Hashed with MD5"], correct: 0 },
      { q: "What is a JWT (JSON Web Token) composed of?", opts: ["Header, Payload, and Signature separated by dots", "Username, Password, and Salt", "Client IP, Timestamp, and Session ID", "Database ID, Role, and Cookie"], correct: 0 },
      { q: "Which Express error-handling middleware signature catches unhandled errors centrally?", opts: ["(err, req, res, next) => { ... }", "(req, res, err) => { ... }", "(error) => { ... }", "(err, callback) => { ... }"], correct: 0 },
      { q: "What does 'app.use(express.json())' do in an Express application?", opts: ["Parses incoming requests with JSON payloads into req.body", "Converts all responses to XML format", "Encrypts all outgoing JSON responses", "Validates JSON against OpenAPI schemas"], correct: 0 },
      { q: "What is rate limiting in an API context?", opts: ["Restricting number of requests a client can make within a timeframe", "Limiting bandwidth speeds for streaming media", "Scaling server pods automatically in Docker", "Compressing HTTP JSON payloads"], correct: 0 },
      { q: "What does the 'idempotent' HTTP method characteristic mean?", opts: ["Multiple identical requests yield identical server state (e.g. GET, PUT, DELETE)", "Requests must execute within 1 second", "Requests require binary file attachments", "Server cannot respond with status 200"], correct: 0 },
      { q: "What is the primary benefit of using connection pooling in MongoDB/PostgreSQL backends?", opts: ["Reuses open database connections to reduce latency and resource overhead", "Encrypts all query parameters in transit", "Automatically generates database indexes", "Eliminates need for primary keys"], correct: 0 },
      { q: "Which environment variable should always be set to 'production' on production Node servers for optimization?", opts: ["NODE_ENV=production", "ENVIRONMENT=prod", "RUN_MODE=live", "APP_ENV=release"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 3: Database Systems (SQL & NoSQL)
  // ==========================================
  {
    slug: "database-systems",
    subtopic: "SQL",
    title: "SQL Fundamentals: Queries, Joins & Normalization",
    description: "Master relational schema design, complex JOINs, indexing performance, and ACID transactions.",
    timeLimit: 15,
    tags: ["sql", "database", "postgres", "mysql", "joins"],
    questions: [
      { q: "Which SQL clause filters groups returned by a GROUP BY clause?", opts: ["HAVING", "WHERE", "FILTER", "LIMIT"], correct: 0 },
      { q: "What type of JOIN returns all records from the left table and matched records from the right?", opts: ["LEFT JOIN (LEFT OUTER JOIN)", "INNER JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correct: 0 },
      { q: "What does the ACID acronym stand for in relational databases?", opts: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Concurrency, Indexing, Delivery", "Authentication, Clustering, Integration, Deletion", "Allocation, Security, Integrity, Durability"], correct: 0 },
      { q: "What is a Primary Key in a relational database?", opts: ["A column or set of columns uniquely identifying each table row", "A key used to decrypt database tables", "The first column added to a table", "A password used by database administrators"], correct: 0 },
      { q: "What is a Foreign Key?", opts: ["A column referencing a Primary Key in another table to enforce referential integrity", "A key imported from an external cloud provider", "A key that cannot contain integer values", "A temporary key for session caching"], correct: 0 },
      { q: "What is the purpose of Database Indexing (like B-Tree indexes)?", opts: ["Speeds up data retrieval queries at the cost of write performance and storage", "Automatically backs up database files to S3", "Encrypts column values from unauthorized users", "Normalizes tables to Third Normal Form"], correct: 0 },
      { q: "Which SQL constraint ensures that all values in a column are distinct?", opts: ["UNIQUE", "NOT NULL", "CHECK", "DEFAULT"], correct: 0 },
      { q: "What is First Normal Form (1NF) requirement?", opts: ["Each column must contain atomic (indivisible) values and rows must be unique", "Every non-key column must depend on primary key", "All foreign keys must be indexed", "Tables must be split across shards"], correct: 0 },
      { q: "What does the SQL command 'ROLLBACK' do inside a transaction block?", opts: ["Reverts all changes made since the transaction began", "Permanently commits changes to disk", "Deletes the target table entirely", "Restarts the database server process"], correct: 0 },
      { q: "Which aggregate function calculates the total sum of numerical column values?", opts: ["SUM()", "COUNT()", "AVG()", "TOTAL()"], correct: 0 },
      { q: "What is the difference between TRUNCATE and DELETE statements in SQL?", opts: ["TRUNCATE drops and recreates table structure faster without logging individual row deletes; DELETE logs row removals", "DELETE is irreversible; TRUNCATE is always reversible", "TRUNCATE allows WHERE clauses; DELETE does not", "They are identical aliases"], correct: 0 },
      { q: "What is an SQL Injection vulnerability?", opts: ["Malicious SQL code injected into untrusted input fields altering query execution", "A hardware fault in database SSD drives", "Memory corruption in connection pools", "Exceeding database disk quota limits"], correct: 0 },
      { q: "How do you prevent SQL Injection attacks reliably?", opts: ["Use Prepared Statements and Parameterized Queries", "Sanitize inputs with regex string replaces", "Encrypt the database password", "Disable GET endpoints"], correct: 0 },
      { q: "What does Third Normal Form (3NF) enforce?", opts: ["Eliminates transitive dependencies: non-key attributes must depend only on the primary key", "Requires all tables to have foreign keys", "Requires data to be stored in JSON columns", "Enforces composite primary keys on all tables"], correct: 0 },
      { q: "Which transaction isolation level provides maximum protection against phantom reads?", opts: ["SERIALIZABLE", "REPEATABLE READ", "READ COMMITTED", "READ UNCOMMITTED"], correct: 0 },
    ]
  },
  {
    slug: "database-systems",
    subtopic: "MongoDB",
    title: "MongoDB & NoSQL Document Database Architecture",
    description: "Explore document-oriented modeling, embedded vs reference patterns, Aggregation pipelines, and indexing.",
    timeLimit: 15,
    tags: ["mongodb", "nosql", "database", "aggregation"],
    questions: [
      { q: "In MongoDB, what is the document storage format used internally for binary representation?", opts: ["BSON (Binary JSON)", "JSON", "Protocol Buffers", "MessagePack"], correct: 0 },
      { q: "What is the default primary key field automatically created on every MongoDB document?", opts: ["_id", "id", "uuid", "pk"], correct: 0 },
      { q: "Which stage in the MongoDB Aggregation Pipeline filters documents similar to a find() query?", opts: ["$match", "$filter", "$find", "$where"], correct: 0 },
      { q: "Which aggregation stage groups documents by a specified identifier to calculate accumulators?", opts: ["$group", "$bucket", "$aggregate", "$combine"], correct: 0 },
      { q: "When should you prefer embedded documents over normalized references in MongoDB?", opts: ["When data is accessed together frequently and has a 'contains' 1:Few relationship", "When documents grow unbounded without limit", "When data is shared across dozens of collections", "When ACID multi-document transactions are required"], correct: 0 },
      { q: "What is the maximum BSON document size limit in MongoDB?", opts: ["16 Megabytes", "4 Megabytes", "64 Megabytes", "Unlimited"], correct: 0 },
      { q: "Which index type should be created to optimize queries sorting on fieldA ascending and fieldB descending?", opts: ["Compound Index { fieldA: 1, fieldB: -1 }", "Single Field Index on fieldA", "Text Index on both fields", "Geospatial 2dsphere index"], correct: 0 },
      { q: "What does the '$lookup' aggregation stage perform?", opts: ["A left outer join to an unsharded collection in the same database", "A full-text search query across documents", "A backup snapshot to remote storage", "A geospatial proximity calculation"], correct: 0 },
      { q: "What is the primary purpose of sharding in MongoDB?", opts: ["Horizontal scaling by distributing data across multiple physical cluster shards", "Automating daily database backups", "Replicating data across secondary nodes for high availability", "Compressing database indexes on disk"], correct: 0 },
      { q: "What is a Replica Set in MongoDB?", opts: ["A cluster group of mongod instances maintaining the same data for high availability", "A set of duplicate documents within a collection", "A scheduled backup snapshot mechanism", "A client connection pool buffer"], correct: 0 },
      { q: "Which update operator adds an element to an array only if it does not already exist?", opts: ["$addToSet", "$push", "$set", "$insert"], correct: 0 },
      { q: "What does a TTL (Time-To-Live) index do in MongoDB?", opts: ["Automatically deletes documents after a specified duration or timestamp", "Expires user sessions in Express cookies", "Throttles queries exceeding 100ms", "Monitors network ping latency"], correct: 0 },
      { q: "Which command returns query execution statistics including whether an index was utilized?", opts: ["explain('executionStats')", "profile('all')", "analyze()", "queryStats()"], correct: 0 },
      { q: "What is the CAP Theorem trade-off MongoDB typically chooses by default?", opts: ["Consistency and Partition Tolerance (CP)", "Availability and Partition Tolerance (AP)", "Consistency and Availability without Partitions", "Neither Consistency nor Availability"], correct: 0 },
      { q: "Which MongoDB feature allows multi-document ACID transactions?", opts: ["Sessions and startSession().startTransaction()", "Automatic two-phase commits in 1NF", "GridFS storage engine", "WiredTiger journal bypass"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 4: Data Structures & Algorithms
  // ==========================================
  {
    slug: "dsa",
    subtopic: "Arrays & Big-O",
    title: "Arrays, Strings & Asymptotic Complexity (Big-O)",
    description: "Evaluate time and space complexity, two-pointer techniques, sliding window patterns, and hashing.",
    timeLimit: 15,
    tags: ["dsa", "algorithms", "arrays", "complexity", "big-o"],
    questions: [
      { q: "What is the average time complexity of accessing an element in an array by index?", opts: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 0 },
      { q: "What is the worst-case time complexity of searching for an element in an unsorted array of size n?", opts: ["O(n)", "O(1)", "O(log n)", "O(n log n)"], correct: 0 },
      { q: "Which algorithmic technique uses two pointers moving towards each other to find a target sum in a sorted array?", opts: ["Two-Pointer Technique", "Sliding Window", "Divide and Conquer", "Dynamic Programming"], correct: 0 },
      { q: "What is the space complexity of an in-place array reversal algorithm?", opts: ["O(1) auxiliary space", "O(n) auxiliary space", "O(log n) auxiliary space", "O(n^2) auxiliary space"], correct: 0 },
      { q: "What is the amortized time complexity of appending an element to a dynamic array (like std::vector or JS array)?", opts: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 0 },
      { q: "Which pattern is optimal for finding the maximum sum subarray of fixed size k?", opts: ["Fixed-size Sliding Window", "Depth-First Search", "Binary Search", "Dijkstra's Algorithm"], correct: 0 },
      { q: "What is the average time complexity of key lookup in a Hash Table with good hash distribution?", opts: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: 0 },
      { q: "What happens in a Hash Table when two distinct keys produce the same hash code?", opts: ["A Hash Collision occurs, resolved by chaining or open addressing", "The second key overwrites the first key permanently", "A runtime segmentation fault is thrown", "The table automatically doubles in size immediately"], correct: 0 },
      { q: "What is the worst-case time complexity of quicksort when the pivot chosen is consistently the smallest or largest element?", opts: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"], correct: 0 },
      { q: "Which sorting algorithm guarantees O(n log n) worst-case time complexity and is stable?", opts: ["Merge Sort", "Quick Sort", "Heap Sort", "Bubble Sort"], correct: 0 },
      { q: "What is the time complexity of Binary Search on a sorted array of size n?", opts: ["O(log n)", "O(1)", "O(n)", "O(n log n)"], correct: 0 },
      { q: "What does the Master Theorem help determine?", opts: ["Asymptotic runtime of divide-and-conquer recurrence relations", "Shortest path in weighted graph networks", "Maximum flow in bipartite matching", "Prime factorization runtime"], correct: 0 },
      { q: "What is the space complexity of merge sort on an array of size n?", opts: ["O(n) auxiliary space", "O(1) auxiliary space", "O(n log n) auxiliary space", "O(log n) auxiliary space"], correct: 0 },
      { q: "Which algorithm finds the majority element (appearing > n/2 times) in O(n) time and O(1) space?", opts: ["Boyer-Moore Voting Algorithm", "Kadane's Algorithm", "Floyd's Cycle Algorithm", "Quickselect Algorithm"], correct: 0 },
      { q: "What is the time complexity of Kadane's algorithm for Maximum Subarray Sum?", opts: ["O(n) time and O(1) space", "O(n log n) time and O(n) space", "O(n^2) time and O(1) space", "O(log n) time and O(1) space"], correct: 0 },
    ]
  },
  {
    slug: "dsa",
    subtopic: "Stacks & Queues",
    title: "Stacks, Queues & Linked Lists",
    description: "Core linear data structures: LIFO stacks, FIFO queues, singly & doubly linked lists, and cycle detection.",
    timeLimit: 15,
    tags: ["dsa", "stacks", "queues", "linked-lists"],
    questions: [
      { q: "What principle governs the behavior of a Stack?", opts: ["LIFO (Last In, First Out)", "FIFO (First In, First Out)", "Priority Based", "Random Access"], correct: 0 },
      { q: "What principle governs the behavior of a Queue?", opts: ["FIFO (First In, First Out)", "LIFO (Last In, First Out)", "LILO (Last In, Last Out)", "Random Access"], correct: 0 },
      { q: "What is the time complexity of inserting a node at the head of a Singly Linked List?", opts: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 0 },
      { q: "Which algorithm detects a cycle in a linked list using slow and fast pointers?", opts: ["Floyd's Tortoise and Hare Algorithm", "Dijkstra's Algorithm", "Kadane's Algorithm", "Kruskal's Algorithm"], correct: 0 },
      { q: "What is the time complexity of finding the middle element of a linked list in a single pass?", opts: ["O(n) using fast and slow pointers", "O(1)", "O(n^2)", "O(log n)"], correct: 0 },
      { q: "Which data structure is naturally suited for verifying balanced parentheses in a string expression?", opts: ["Stack", "Queue", "Heap", "Graph"], correct: 0 },
      { q: "How can a Queue be implemented using two Stacks?", opts: ["Push to Stack1; for pop, transfer to Stack2 to reverse order", "Concatenate both stacks linearly", "Stacks cannot implement a queue", "Use recursion on Stack1 alone"], correct: 0 },
      { q: "What is the time complexity of deleting a node given only a pointer to that node in a Singly Linked List?", opts: ["O(1) by copying next node's value and bypassing it", "O(n)", "O(log n)", "Impossible without head pointer"], correct: 0 },
      { q: "What is a Deque (Double-Ended Queue)?", opts: ["A queue where insertions and deletions can occur at both ends", "A queue holding duplicate values only", "A queue with priority sorting", "A queue implemented on disk"], correct: 0 },
      { q: "Which problem can be solved in O(n) using a Monotonic Stack?", opts: ["Next Greater Element for all array elements", "Shortest path in unweighted graph", "Finding connected components", "Matrix multiplication"], correct: 0 },
      { q: "What is the advantage of a Doubly Linked List over a Singly Linked List?", opts: ["Bidirectional traversal and O(1) removal when node pointer is given", "Less memory overhead per node", "Automatic cache-line prefetching", "Sorted insertion in O(1)"], correct: 0 },
      { q: "In a circular queue with capacity C, how is the next index calculated from current index i?", opts: ["(i + 1) % C", "(i + 1) / C", "i + 1", "i * 2 % C"], correct: 0 },
      { q: "What is the minimum number of pointers needed in an XOR Linked List node?", opts: ["One pointer field storing XOR of previous and next node addresses", "Two pointers", "Three pointers", "Zero pointers"], correct: 0 },
      { q: "What data structure does the CPU call stack utilize to manage function execution frames?", opts: ["Stack", "Queue", "Binary Tree", "Hash Table"], correct: 0 },
      { q: "Which data structure is typically used to implement Breadth-First Search (BFS)?", opts: ["Queue", "Stack", "Binary Search Tree", "Disjoint Set"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 5: Python & Data Science
  // ==========================================
  {
    slug: "data-science",
    subtopic: "Python",
    title: "Python Core Programming: Structures & Functions",
    description: "Core Python semantics: lists, dicts, generators, comprehensions, decorators, and memory management.",
    timeLimit: 15,
    tags: ["python", "data-structures", "core"],
    questions: [
      { q: "Which of the following built-in Python data types is mutable?", opts: ["list", "tuple", "str", "frozenset"], correct: 0 },
      { q: "What keyword is used to create a generator function in Python?", opts: ["yield", "return", "generate", "async"], correct: 0 },
      { q: "What does the expression '[x**2 for x in range(5) if x % 2 == 0]' produce?", opts: ["[0, 4, 16]", "[0, 1, 4, 9, 16]", "[4, 16]", "[0, 2, 4]"], correct: 0 },
      { q: "What is a Python decorator?", opts: ["A function that takes another function as an argument and extends its behavior", "A CSS module for formatting terminal logs", "A class attribute that freezes variables", "A syntax for importing C libraries"], correct: 0 },
      { q: "What is the GIL (Global Interpreter Lock) in CPython?", opts: ["A mutex preventing multiple native threads from executing Python bytecodes concurrently", "A file lock protecting database writes", "A security sandbox for untrusted scripts", "A memory compression algorithm"], correct: 0 },
      { q: "What will 'bool([])' evaluate to in Python?", opts: ["False (empty collections are falsy)", "True", "None", "ValueError"], correct: 0 },
      { q: "What is the difference between 'is' and '==' in Python?", opts: ["'is' checks object identity (memory address); '==' checks value equality", "'is' checks value equality; '==' checks memory address", "They are identical aliases", "'is' is only used for numbers"], correct: 0 },
      { q: "Which built-in module provides high-performance container datatypes like deque, Counter, and defaultdict?", opts: ["collections", "itertools", "functools", "math"], correct: 0 },
      { q: "What does '*args' in a Python function definition allow?", opts: ["Accepting arbitrary positional arguments as a tuple", "Accepting keyword arguments as a dictionary", "Unpacking pointer addresses", "Enforcing strict typing"], correct: 0 },
      { q: "What does '**kwargs' in a Python function definition allow?", opts: ["Accepting arbitrary keyword arguments as a dictionary", "Accepting positional arguments as a list", "Iterating over binary streams", "Creating global variables"], correct: 0 },
      { q: "What is the purpose of the '__init__' method in a Python class?", opts: ["Constructor initializer called when an instance is created", "Destructor called upon garbage collection", "Static class method for string representation", "Private method for encryption"], correct: 0 },
      { q: "Which function converts a dictionary into an iterator of key-value tuples?", opts: ["dict.items()", "dict.keys()", "dict.values()", "dict.entries()"], correct: 0 },
      { q: "What does the 'with' statement manage automatically in Python (e.g. 'with open(...)')?", opts: ["Context management: executes __enter__ and guarantees __exit__ cleanup", "Creates a background daemon thread", "Accelerates file read speed via GPU", "Caches file contents in Redis"], correct: 0 },
      { q: "What is the time complexity of key lookup in a Python dictionary on average?", opts: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 0 },
      { q: "What does 'deepcopy' from the 'copy' module do?", opts: ["Recursively copies compound objects and all objects contained within them", "Copies only top-level references", "Creates an immutable tuple from a list", "Saves an object to a SQLite database"], correct: 0 },
    ]
  },
  {
    slug: "data-science",
    subtopic: "Pandas & NumPy",
    title: "Data Analysis with Pandas & NumPy Essentials",
    description: "Data wrangling with DataFrames, vectorized array operations, missing data handling, and grouping.",
    timeLimit: 15,
    tags: ["pandas", "numpy", "data-science", "analytics"],
    questions: [
      { q: "What is the fundamental multi-dimensional array object in NumPy?", opts: ["ndarray", "Series", "DataFrame", "Matrix"], correct: 0 },
      { q: "Which Pandas method reads a comma-separated values file into a DataFrame?", opts: ["pd.read_csv()", "pd.load_csv()", "pd.parse_csv()", "pd.from_csv()"], correct: 0 },
      { q: "What is the primary difference between .loc[] and .iloc[] in Pandas?", opts: [".loc is label-based indexing; .iloc is integer position-based indexing", ".loc is for rows only; .iloc is for columns only", "They are identical aliases", ".iloc accepts boolean masks; .loc does not"], correct: 0 },
      { q: "Which method fills missing (NaN) values in a Pandas DataFrame?", opts: ["df.fillna()", "df.replace_null()", "df.clean()", "df.interpolate_all()"], correct: 0 },
      { q: "What does NumPy's vectorization achieve compared to Python for-loops?", opts: ["Executes operations in compiled C at CPU level, dramatically speeding up math", "Translates Python code to JavaScript", "Compresses arrays into zip archives", "Ensures thread safety on multi-core GPUs"], correct: 0 },
      { q: "Which Pandas method performs SQL-like aggregations after grouping by one or more columns?", opts: ["df.groupby().agg()", "df.aggregate_by()", "df.cluster()", "df.summarize()"], correct: 0 },
      { q: "What is the result of 'np.zeros((3, 4))'?", opts: ["A 3-row by 4-column 2D array of float zeros", "A 1D array of 12 zeros", "A 4-row by 3-column matrix", "A tuple of 7 elements"], correct: 0 },
      { q: "Which Pandas function merges two DataFrames along a common key similar to an SQL JOIN?", opts: ["pd.merge()", "pd.concat()", "pd.append()", "pd.combine()"], correct: 0 },
      { q: "How do you drop duplicate rows from a DataFrame?", opts: ["df.drop_duplicates()", "df.unique()", "df.distinct()", "df.remove_copies()"], correct: 0 },
      { q: "What does 'df.describe()' output?", opts: ["Descriptive summary statistics (mean, std, min, max, percentiles) for numeric columns", "Column names and their memory addresses", "The first 5 rows of the DataFrame", "SQL schema definitions"], correct: 0 },
      { q: "What is broadcasting in NumPy?", opts: ["How NumPy treats arrays with different shapes during arithmetic operations", "Transmitting arrays over WebSocket sockets", "Printing arrays to terminal standard output", "Converting integers to floating point numbers"], correct: 0 },
      { q: "Which function computes Pearson correlation coefficients between numerical DataFrame columns?", opts: ["df.corr()", "df.covariance()", "df.pearsons()", "df.stats()"], correct: 0 },
      { q: "What is the difference between 'axis=0' and 'axis=1' in Pandas DataFrame operations?", opts: ["axis=0 operates down the rows (column-wise); axis=1 operates across the columns (row-wise)", "axis=0 is for 3D tensors; axis=1 is for 2D tables", "They produce identical operations", "axis=0 only works on string columns"], correct: 0 },
      { q: "How do you reshape a 1D NumPy array of 12 elements into a 3x4 2D matrix?", opts: ["arr.reshape(3, 4)", "arr.resize(12)", "arr.transpose(3, 4)", "arr.shape = (12)"], correct: 0 },
      { q: "Which method converts a Pandas column from object/string data type to numeric, coercing invalid values to NaN?", opts: ["pd.to_numeric(col, errors='coerce')", "col.astype(int)", "col.to_number()", "pd.convert_float(col)"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 6: Artificial Intelligence & ML
  // ==========================================
  {
    slug: "artificial-intelligence",
    subtopic: "Machine Learning",
    title: "Machine Learning Fundamentals & Model Types",
    description: "Core ML concepts: Supervised vs Unsupervised learning, evaluation metrics, overfitting, and bias-variance tradeoff.",
    timeLimit: 15,
    tags: ["ai", "machine-learning", "models"],
    questions: [
      { q: "What characterizes Supervised Machine Learning?", opts: ["Training data consists of input features paired with labeled ground truth targets", "Algorithms discover patterns without any labels", "Agents learn via rewards in an environment", "Models generate realistic synthetic images"], correct: 0 },
      { q: "Which algorithm is commonly used for classification problems by finding the maximum-margin hyperplane?", opts: ["Support Vector Machine (SVM)", "K-Means Clustering", "Linear Regression", "Principal Component Analysis (PCA)"], correct: 0 },
      { q: "What metric evaluates classification performance on highly imbalanced datasets better than raw Accuracy?", opts: ["F1-Score (Harmonic mean of Precision and Recall)", "Accuracy Percentage", "Mean Squared Error (MSE)", "R-squared"], correct: 0 },
      { q: "What is Overfitting in machine learning?", opts: ["Model learns training noise and performs poorly on unseen test data", "Model is too simple to capture underlying data patterns", "Model converges too slowly during gradient descent", "Dataset contains too few features"], correct: 0 },
      { q: "What technique prevents overfitting by penalizing large weights with an L2 norm penalty?", opts: ["Ridge Regularization (L2)", "Lasso Regularization (L1)", "Early Stop Dropout", "Data Decimation"], correct: 0 },
      { q: "What is the primary role of Cross-Validation (e.g. k-fold)?", opts: ["Assessing model generalizability by training on k-1 folds and validating on the remaining fold", "Encrypting training weights before deployment", "Cleaning missing values from dataset", "Converting text features to embeddings"], correct: 0 },
      { q: "Which of the following is an Unsupervised Learning algorithm?", opts: ["K-Means Clustering", "Logistic Regression", "Random Forest Classifier", "Linear Regression"], correct: 0 },
      { q: "What is the Bias-Variance Tradeoff?", opts: ["High bias leads to underfitting; high variance leads to overfitting", "Higher accuracy always causes higher latency", "Training loss equals validation loss", "Feature count equals sample count"], correct: 0 },
      { q: "In a Confusion Matrix, what is a False Positive (Type I Error)?", opts: ["Negative instance incorrectly predicted as positive", "Positive instance incorrectly predicted as negative", "Correctly identified positive instance", "Negative instance classified correctly"], correct: 0 },
      { q: "What does ROC-AUC score measure?", opts: ["The model's ability to distinguish between classes across all classification thresholds", "The training speed in milliseconds", "The parameter count of the model", "The ratio of true negatives to total rows"], correct: 0 },
      { q: "Which ensemble technique builds multiple independent trees and averages their predictions?", opts: ["Bagging (e.g. Random Forest)", "Boosting (e.g. XGBoost)", "Stacking", "Linear Stride"], correct: 0 },
      { q: "What is Gradient Descent used for in machine learning?", opts: ["Iteratively minimizing a loss function by updating parameters in direction of steepest descent", "Splitting datasets into train and test sets", "Generating random seed weights", "Normalizing text strings"], correct: 0 },
      { q: "Which dimensionality reduction technique finds orthogonal axes maximizing variance?", opts: ["Principal Component Analysis (PCA)", "t-SNE", "UMAP", "Decision Trees"], correct: 0 },
      { q: "What does the learning rate hyperparameter control in gradient descent?", opts: ["The step size taken towards the minimum of the loss function at each iteration", "The number of training epochs", "The batch size of the dataset", "The number of layers in a neural network"], correct: 0 },
      { q: "Which metric is the standard loss function for binary classification models?", opts: ["Binary Cross-Entropy (Log Loss)", "Mean Absolute Error (MAE)", "Mean Squared Error (MSE)", "Hinge Loss"], correct: 0 },
    ]
  },
  {
    slug: "artificial-intelligence",
    subtopic: "Generative AI",
    title: "Large Language Models & Generative AI Systems",
    description: "Transformer architecture, Attention mechanisms, Prompt Engineering, tokenization, and RAG pipelines.",
    timeLimit: 15,
    tags: ["ai", "llm", "generative-ai", "rag", "transformers"],
    questions: [
      { q: "What fundamental mechanism powers the Transformer architecture (Vaswani et al., 2017)?", opts: ["Self-Attention Mechanism", "Recurrent Hidden States", "Convolutional Kernels", "Markov Decision Processes"], correct: 0 },
      { q: "What is a Token in the context of Large Language Models?", opts: ["A basic unit of text (word fragment, word, or character) processed by the model", "An OAuth bearer access key", "A database record identifier", "A hardware GPU thread ID"], correct: 0 },
      { q: "What does RAG stand for in modern AI system architecture?", opts: ["Retrieval-Augmented Generation", "Recursive Attention Gradients", "Real-time Autonomous Graphs", "Redundant Array of GPUs"], correct: 0 },
      { q: "In LLM generation, what does the Temperature parameter control?", opts: ["Randomness and creativity of token selection (higher = more creative/random)", "Physical hardware operating temperature of the GPU", "Context window size in tokens", "Rate limit of API calls per second"], correct: 0 },
      { q: "What is Hallucination in Large Language Models?", opts: ["Generating plausible-sounding but factually incorrect or ungrounded statements", "A hardware memory segmentation fault", "Dropping WebSocket connections mid-stream", "Exceeding the model's token limit"], correct: 0 },
      { q: "Which prompting technique asks an LLM to explain its reasoning step-by-step before the answer?", opts: ["Chain-of-Thought (CoT) Prompting", "Zero-Shot Prompting", "Few-Shot Prompting", "Directional Stimulus Prompting"], correct: 0 },
      { q: "What is Vector Embedding in AI systems?", opts: ["High-dimensional numerical array capturing the semantic meaning of text or media", "A compressed bitmap image representation", "An encrypted hash of a user prompt", "A primary key index in Postgres"], correct: 0 },
      { q: "What role does a Vector Database (like Pinecone, Milvus, Chroma) serve in a RAG pipeline?", opts: ["Indexes and retrieves high-dimensional vector embeddings using similarity search", "Compiles Python code into machine language", "Stores user passwords securely", "Handles HTTP rate limiting"], correct: 0 },
      { q: "What is RLHF in modern LLM alignment?", opts: ["Reinforcement Learning from Human Feedback", "Recursive Layered Hardware Framing", "Randomized Low-rank Hyperparameter Fitting", "Real-time Language Heuristic Filtering"], correct: 0 },
      { q: "Which metric measures the similarity between two vector embeddings based on angle rather than magnitude?", opts: ["Cosine Similarity", "Euclidean Distance", "Manhattan Distance", "Hamming Distance"], correct: 0 },
      { q: "What is Context Window in an LLM?", opts: ["The maximum total tokens (prompt + completion) the model can process in a single request", "The browser window size running the chat UI", "The number of concurrent users on the server", "The token budget allowed per user subscription"], correct: 0 },
      { q: "What does Quantization (e.g. 4-bit, 8-bit GGUF) do to an LLM weight model?", opts: ["Reduces precision of numerical weights to decrease VRAM footprint and speed up inference", "Increases model parameters by 4x", "Translates model weights to WebAssembly", "Encrypts model weights from reverse engineering"], correct: 0 },
      { q: "What is Few-Shot Prompting?", opts: ["Providing the model with a few demonstration input-output examples in the prompt", "Training a model on only 3 data samples", "Running queries across 5 concurrent GPUs", "Generating images using Stable Diffusion"], correct: 0 },
      { q: "What is the purpose of Top-P (Nucleus) Sampling?", opts: ["Restricts token sampling to smallest set of candidates whose cumulative probability exceeds P", "Selects only top-rated GPU processors", "Limits output to P sentences maximum", "Sorts prompts by character count"], correct: 0 },
      { q: "What is Fine-Tuning in modern LLM development (e.g. LoRA)?", opts: ["Adapting a pre-trained model on specialized domain data by updating a small subset of weights", "Writing prompt templates in markdown", "Installing CUDA drivers on Ubuntu", "Setting environment variables on Render"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 7: Cyber Security & Web Safety
  // ==========================================
  {
    slug: "cyber-security",
    subtopic: "Web Security",
    title: "Web Security & OWASP Top 10 Vulnerabilities",
    description: "Defend applications against XSS, CSRF, SQL Injection, SSRF, Broken Access Control, and Insecure Deserialization.",
    timeLimit: 15,
    tags: ["security", "owasp", "cyber-security", "xss", "csrf"],
    questions: [
      { q: "What is Cross-Site Scripting (XSS)?", opts: ["Vulnerability where malicious scripts are injected into trusted websites and executed in user browsers", "Intercepting network packets over unencrypted Wi-Fi", "Flooding servers with volumetric UDP traffic", "Brute-forcing administrator SSH passwords"], correct: 0 },
      { q: "How do you protect cookies containing authentication tokens against XSS theft?", opts: ["Set the 'HttpOnly' flag so JavaScript cannot access document.cookie", "Encrypt cookies with Base64", "Store cookies in localStorage instead", "Set cookie expiration to 10 years"], correct: 0 },
      { q: "What does the 'SameSite=Strict' or 'SameSite=Lax' cookie attribute defend against?", opts: ["Cross-Site Request Forgery (CSRF)", "SQL Injection", "Distributed Denial of Service (DDoS)", "Man-in-the-Middle attacks"], correct: 0 },
      { q: "What is Cross-Site Request Forgery (CSRF)?", opts: ["Tricking an authenticated victim's browser into executing unwanted actions on a trusted site", "Stealing database password hashes via error messages", "Injecting rogue DNS records into a nameserver", "Tampering with TLS certificates"], correct: 0 },
      { q: "What is SQL Injection and how is it reliably prevented?", opts: ["Injecting unauthorized SQL commands via input; prevented by using Parameterized Queries", "Injecting CSS into headers; prevented by disabling Flexbox", "Overloading database RAM; prevented by sharding", "Corrupting SQLite files; prevented by backups"], correct: 0 },
      { q: "What security header prevents a website from being rendered inside an <iframe> (Clickjacking defense)?", opts: ["X-Frame-Options: DENY (or CSP frame-ancestors 'none')", "X-XSS-Protection: 1", "Strict-Transport-Security", "Access-Control-Allow-Origin: *"], correct: 0 },
      { q: "What does the HSTS (HTTP Strict Transport Security) header force browsers to do?", opts: ["Communicate exclusively over HTTPS connections, converting all HTTP links automatically", "Block requests from unauthorized IP addresses", "Cache static assets for 1 year", "Enforce 16-character passwords"], correct: 0 },
      { q: "What is Server-Side Request Forgery (SSRF)?", opts: ["Vulnerability where an attacker induces a server to send requests to an unexpected destination (e.g. internal cloud metadata)", "Tampering with client localStorage", "Sniffing SSL packets on LAN", "Cracking JWT secret keys"], correct: 0 },
      { q: "Why is storing plaintext API secrets in public GitHub repositories dangerous?", opts: ["Automated bot scrapers extract leaked keys within seconds to compromise infrastructure", "Git commits consume excessive disk space", "GitHub automatically revokes user accounts", "Markdown renderers will corrupt code blocks"], correct: 0 },
      { q: "What is the recommended cryptographic algorithm for hashing user passwords?", opts: ["Argon2id or bcrypt with adaptive work factor", "SHA-256 without salt", "MD5", "Base64 encryption"], correct: 0 },
      { q: "What is a Replay Attack and how is it mitigated in secure API designs?", opts: ["Attacker intercepts and resends valid data packets; mitigated using Nonces and short-lived Timestamps", "Attacker repeatedly reloads the login page", "Attacker sends duplicate emails to support", "Attacker copies the CSS stylesheet"], correct: 0 },
      { q: "What does the Principle of Least Privilege dictate in access control?", opts: ["Users and processes should only possess the minimum permissions required to perform their tasks", "All users must have administrator rights", "Passwords must be reset every 2 hours", "Databases must reject all outside connections"], correct: 0 },
      { q: "What is Rate Limiting and DDoS mitigation in web security?", opts: ["Throttling request frequency per IP/token to prevent brute force and service exhaustion", "Encrypting database hard drives", "Enforcing CAPTCHA on every single click", "Deleting inactive student accounts"], correct: 0 },
      { q: "What is the purpose of Content Security Policy (CSP)?", opts: ["Restricts sources from which scripts, styles, images, and fonts can be loaded and executed", "Compresses HTTP response bodies", "Generates SSL certificates automatically", "Logs user mouse coordinates"], correct: 0 },
      { q: "What vulnerability occurs when an API endpoint uses user-supplied IDs to fetch records without ownership checks?", opts: ["BOLA / IDOR (Broken Object Level Authorization)", "Cross-Site Scripting", "XML External Entity (XXE)", "Buffer Overflow"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 8: Cloud Computing & DevOps
  // ==========================================
  {
    slug: "cloud-computing",
    subtopic: "DevOps & Docker",
    title: "Docker Containers, Microservices & CI/CD Pipelines",
    description: "Containerization fundamentals, multi-stage Docker builds, Kubernetes orchestration, and CI/CD pipelines.",
    timeLimit: 15,
    tags: ["cloud", "docker", "devops", "kubernetes", "ci-cd"],
    questions: [
      { q: "What is the primary difference between a Docker Container and a Virtual Machine?", opts: ["Containers share the host OS kernel and are lightweight; VMs run a full guest OS on a hypervisor", "Containers require hardware virtualization (VT-x)", "VMs boot in milliseconds; containers take minutes", "Containers cannot run Linux"], correct: 0 },
      { q: "What does a Dockerfile specify?", opts: ["Step-by-step instructions for building a reproducible Docker container image", "The network topology of AWS VPC", "The Kubernetes cluster secrets", "The Git repository commit history"], correct: 0 },
      { q: "What is the benefit of Multi-Stage Builds in Docker?", opts: ["Keeps production images minimal and secure by separating build tools from runtime artifacts", "Compiles code simultaneously across multiple CPU cores", "Allows running Windows and Linux in the same container", "Generates SSL certificates during build"], correct: 0 },
      { q: "Which command starts multi-container Docker applications defined in a docker-compose.yml file?", opts: ["docker compose up -d", "docker start all", "docker run -compose", "docker build -d"], correct: 0 },
      { q: "What is the smallest deployable compute unit in Kubernetes?", opts: ["Pod", "Cluster", "Node", "Service"], correct: 0 },
      { q: "What does the Kubernetes Deployment object manage?", opts: ["Declarative updates, automated rollouts, rollbacks, and replica counts for Pods", "DNS routing between cloud regions", "Physical hardware server cooling", "Billing metrics in cloud accounts"], correct: 0 },
      { q: "What is Continuous Integration (CI) in DevOps practices?", opts: ["Automating code merges, linting, builds, and automated testing upon every commit or PR", "Deploying code to production without testing", "Rebuilding hardware servers daily", "Manually approving pull requests via email"], correct: 0 },
      { q: "What is Infrastructure as Code (IaC)?", opts: ["Managing and provisioning infrastructure through machine-readable code files (e.g. Terraform)", "Writing Python scripts directly on production servers", "Storing code in AWS S3 buckets", "Using HTML to design data centers"], correct: 0 },
      { q: "What is an AWS S3 Bucket commonly used for?", opts: ["Highly durable object storage for files, media, and static website hosting", "Running PostgreSQL database engines", "Executing serverless container microservices", "Providing physical Ethernet cables"], correct: 0 },
      { q: "What is an AWS Lambda function?", opts: ["A serverless compute service that executes code in response to events without provisioning servers", "A dedicated bare-metal server cluster", "A relational database storage tier", "A DNS nameserver daemon"], correct: 0 },
      { q: "What does the 'EXPOSE' directive in a Dockerfile do?", opts: ["Documents the port on which the container listens at runtime (metadata documentation)", "Publishes the port to the host machine automatically", "Opens firewall ports in cloud routers", "Encrypts container network traffic"], correct: 0 },
      { q: "What is blue-green deployment strategy?", opts: ["Running two identical environments (blue active, green staging) to achieve zero-downtime cutover", "Deploying code only on weekends", "Testing code directly in production", "Using green terminal color schemes"], correct: 0 },
      { q: "What does a Docker Volume provide?", opts: ["Persistent data storage independent of the container lifecycle", "Audio volume control for containers", "Memory compression for microservices", "CPU throttling metrics"], correct: 0 },
      { q: "Which tool is standard for automated container vulnerability scanning?", opts: ["Trivy or Snyk", "Curl", "Vim", "Ping"], correct: 0 },
      { q: "What is a reverse proxy like NGINX used for in production microservice deployments?", opts: ["Load balancing traffic, SSL termination, and reverse proxying to backend services", "Storing user database records", "Compiling TypeScript files", "Managing Kubernetes secrets"], correct: 0 },
    ]
  },

  // ==========================================
  // TOPIC 9: Mobile App Development
  // ==========================================
  {
    slug: "mobile-apps",
    subtopic: "React Native",
    title: "Cross-Platform Mobile Apps with React Native",
    description: "Build iOS & Android apps: native bridging, flexbox mobile layouts, navigation, and state synchronization.",
    timeLimit: 15,
    tags: ["mobile", "react-native", "android", "ios"],
    questions: [
      { q: "What does React Native compile your JavaScript components into on iOS and Android?", opts: ["Real native platform UI widgets (UIView on iOS, android.view.View on Android)", "A WebViews HTML/CSS container", "A canvas 2D game surface", "A binary C++ executable"], correct: 0 },
      { q: "Which primitive component in React Native replaces the HTML <div> for layout grouping?", opts: ["<View>", "<Container>", "<Div>", "<Section>"], correct: 0 },
      { q: "Which primitive component in React Native must wrap all text content to display it?", opts: ["<Text>", "<Paragraph>", "<span>", "<Label>"], correct: 0 },
      { q: "In React Native, what is the default 'flexDirection' of a <View> container?", opts: ["column (vertical by default on mobile)", "row", "row-reverse", "grid"], correct: 0 },
      { q: "Which library is standard for stack and tab navigation in React Native applications?", opts: ["React Navigation (@react-navigation/native)", "React Router DOM", "Next.js Navigation", "Express Router"], correct: 0 },
      { q: "How do you handle user touch interactions in React Native without web click delays?", opts: ["<TouchableOpacity> or <Pressable>", "<button>", "onClick listener", "<GestureView>"], correct: 0 },
      { q: "What is AsyncStorage used for in React Native?", opts: ["Unencrypted, asynchronous, persistent key-value storage system for mobile apps", "Connecting to remote MongoDB databases", "Handling Bluetooth device communication", "Streaming camera video feeds"], correct: 0 },
      { q: "Which component is optimized for rendering large dynamic scrollable lists efficiently on mobile?", opts: ["<FlatList>", "<ScrollView>", "<ListView>", "<VirtualTable>"], correct: 0 },
      { q: "Why is <FlatList> more performant than <ScrollView> for long lists of items?", opts: ["It renders only visible items within window and recycles unrendered items to save memory", "It compresses images into SVG format", "It downloads items using WebSockets", "It compiles list rows to Objective-C"], correct: 0 },
      { q: "What is Expo in the React Native ecosystem?", opts: ["A framework and tooling platform that streamlines building, testing, and deploying React Native apps", "A database engine for mobile apps", "A cloud hosting server for Node.js", "A replacement for JavaScript"], correct: 0 },
      { q: "What is the new React Native Architecture (Fabric / TurboModules) designed to achieve?", opts: ["Replaces the asynchronous JSON bridge with synchronous JSI (JavaScript Interface) for near-instant native communication", "Replaces React with Vue.js", "Eliminates need for Android Studio", "Forces apps to run only on Apple devices"], correct: 0 },
      { q: "How are platform-specific styles applied conditionally in React Native?", opts: ["Platform.OS === 'ios' ? styleA : styleB or Platform.select()", "CSS @media screen and (ios)", "Browser user-agent string checks", "HTML conditional comments"], correct: 0 },
      { q: "Which component handles status bar coloring and transparency across iOS and Android?", opts: ["<StatusBar>", "<DeviceBar>", "<HeaderTop>", "<ScreenBar>"], correct: 0 },
      { q: "What is SafeAreaView used for in modern mobile UI design?", opts: ["Renders content within the safe boundary limits of device notches, home bars, and rounded corners", "Protects apps against reverse-engineering attacks", "Restricts apps to children under 13", "Enforces HTTPS certificate validation"], correct: 0 },
      { q: "Which React Native API monitors device network connectivity state?", opts: ["NetInfo (@react-native-community/netinfo)", "navigator.onLine", "window.network", "DeviceInfo.isOnline()"], correct: 0 },
    ]
  }
];

/**
 * Strict database sanitizer:
 * Clamps all existing quizzes in MongoDB to strictly maxAttempts = 3.
 * Eliminates any 10 or unbounded attempt allocations.
 */
export const sanitizeMaxAttempts = async () => {
  try {
    const result = await Quiz.updateMany(
      { $or: [{ maxAttempts: { $gt: 3 } }, { maxAttempts: { $exists: false } }, { maxAttempts: 10 }] },
      { $set: { maxAttempts: 3 } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🛡️ [DB SANITIZE] Successfully clamped ${result.modifiedCount} quizzes to maxAttempts: 3`);
    }
    await redisCache.delPattern("quizzes:*");
    return result.modifiedCount;
  } catch (err) {
    console.warn("⚠️ [DB SANITIZE] Sanitize maxAttempts warning:", err.message);
    return 0;
  }
};

/**
 * Seeds or verifies granular catalog quizzes for an interest slug (or all if none provided).
 * Provides students with dedicated quiz choices (HTML, CSS, JS, React, Node, etc.).
 */
export const seedCatalogQuizzes = async (targetSlug = null) => {
  try {
    let instructor = await User.findOne({ role: "instructor" });
    if (!instructor) {
      instructor = await User.findOne({ role: "admin" });
    }
    if (!instructor) {
      instructor = await User.create({
        name: "Quimora Faculty",
        email: "instructor@quimora.edu",
        password: "Password123!",
        role: "instructor",
        active: true,
      });
    }

    const itemsToSeed = targetSlug
      ? QUIZZES_CATALOG.filter((i) => i.slug === targetSlug)
      : QUIZZES_CATALOG;

    let seededCount = 0;

    for (const item of itemsToSeed) {
      const interest = await Interest.findOne({ slug: item.slug });
      if (!interest) {
        continue;
      }

      let quiz = await Quiz.findOne({ title: item.title });
      if (!quiz) {
        quiz = new Quiz({
          title: item.title,
          description: item.description,
          timeLimit: item.timeLimit,
          createdBy: instructor._id,
          interestIds: [interest._id],
          tags: [...(interest.topicTags || []), item.subtopic?.toLowerCase(), "topic-choice"].filter(Boolean),
          status: "published",
          isActive: true,
          maxAttempts: 3, // STRICTLY 3 attempts
          passingScore: 60,
          negativeMarking: 25,
        });
        await quiz.save();
        seededCount++;
      } else {
        // Enforce strict 3 attempts and published state
        quiz.maxAttempts = 3;
        quiz.status = "published";
        quiz.isActive = true;
        if (!quiz.interestIds || !quiz.interestIds.includes(interest._id)) {
          quiz.interestIds = [interest._id];
        }
        await quiz.save();
      }

      // Assign to instructor
      await QuizAssignment.findOneAndUpdate(
        { quizId: quiz._id },
        { instructorId: instructor._id, role: "primary", assignedAt: new Date() },
        { upsert: true, new: true }
      );

      // Verify or insert questions
      const existingQuestionsCount = await Question.countDocuments({ quizId: quiz._id });
      if (existingQuestionsCount === 0) {
        const formattedQuestions = createQuestions(item.title, item.questions);
        const questionDocs = formattedQuestions.map((q) => ({
          ...q,
          quizId: quiz._id,
        }));
        const inserted = await Question.insertMany(questionDocs);
        quiz.questions = inserted.map((q) => q._id);
        await quiz.save();
      }
    }

    if (seededCount > 0) {
      await redisCache.delPattern("quizzes:*");
    }

    return seededCount;
  } catch (err) {
    console.error("❌ [CATALOG SEEDER] Error seeding catalog quizzes:", err.message);
    return 0;
  }
};
