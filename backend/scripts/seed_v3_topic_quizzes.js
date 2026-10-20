import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Interest from "../models/interest.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAssignment from "../models/quizAssignment.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

const TOPIC_QUIZZES = [
  {
    slug: "web-foundations",
    quizTitle: "HTML5, CSS3 & JavaScript Essentials",
    description: "Master foundational web concepts: semantic tags, responsive styling, and core JavaScript.",
    timeLimit: 10,
    questions: [
      {
        questionText: "Which HTML5 semantic element should be used for the primary navigation links of a website?",
        options: [
          { optionText: "<nav>", isCorrect: true },
          { optionText: "<header>", isCorrect: false },
          { optionText: "<section>", isCorrect: false },
          { optionText: "<aside>", isCorrect: false },
        ],
      },
      {
        questionText: "In CSS, what does the 'box-sizing: border-box' property do?",
        options: [
          { optionText: "Includes padding and border within the element's total width and height", isCorrect: true },
          { optionText: "Adds a drop shadow around the element's border", isCorrect: false },
          { optionText: "Excludes margins from the page layout calculations", isCorrect: false },
          { optionText: "Forces the element to always be a square", isCorrect: false },
        ],
      },
      {
        questionText: "Which JavaScript keyword declares a block-scoped variable that can be reassigned?",
        options: [
          { optionText: "let", isCorrect: true },
          { optionText: "const", isCorrect: false },
          { optionText: "var", isCorrect: false },
          { optionText: "static", isCorrect: false },
        ],
      },
      {
        questionText: "How do you select an element with id 'header' using standard JavaScript DOM query?",
        options: [
          { optionText: "document.querySelector('#header')", isCorrect: true },
          { optionText: "document.getElementByClass('header')", isCorrect: false },
          { optionText: "document.select('header')", isCorrect: false },
          { optionText: "document.find('#header')", isCorrect: false },
        ],
      },
      {
        questionText: "Which CSS Flexbox property aligns items along the cross-axis?",
        options: [
          { optionText: "align-items", isCorrect: true },
          { optionText: "justify-content", isCorrect: false },
          { optionText: "flex-direction", isCorrect: false },
          { optionText: "flex-wrap", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "modern-web",
    quizTitle: "React & Modern Web Frameworks Starter",
    description: "Test your understanding of React component states, hooks, JSX, and Node.js REST basics.",
    timeLimit: 10,
    questions: [
      {
        questionText: "What hook is used to manage local state inside a functional React component?",
        options: [
          { optionText: "useState", isCorrect: true },
          { optionText: "useEffect", isCorrect: false },
          { optionText: "useContext", isCorrect: false },
          { optionText: "useReducer", isCorrect: false },
        ],
      },
      {
        questionText: "Why is a unique 'key' prop required when rendering lists of elements in React?",
        options: [
          { optionText: "To help React identify which items have changed, been added, or removed for reconciliation", isCorrect: true },
          { optionText: "To set the DOM id attribute automatically on the rendered tag", isCorrect: false },
          { optionText: "To trigger CSS styling animations automatically", isCorrect: false },
          { optionText: "To allow access to the database record ID", isCorrect: false },
        ],
      },
      {
        questionText: "In Express.js (Node), what function is used to handle GET requests at the '/users' path?",
        options: [
          { optionText: "app.get('/users', (req, res) => { ... })", isCorrect: true },
          { optionText: "app.post('/users', (req, res) => { ... })", isCorrect: false },
          { optionText: "app.useFetch('/users')", isCorrect: false },
          { optionText: "app.routeGet('/users')", isCorrect: false },
        ],
      },
      {
        questionText: "What does JSX stand for in React development?",
        options: [
          { optionText: "JavaScript XML", isCorrect: true },
          { optionText: "JSON Syntax Extension", isCorrect: false },
          { optionText: "Java Standard Execution", isCorrect: false },
          { optionText: "JavaScript XHR", isCorrect: false },
        ],
      },
      {
        questionText: "Which HTTP status code indicates a successful resource creation in a REST API?",
        options: [
          { optionText: "201 Created", isCorrect: true },
          { optionText: "200 OK", isCorrect: false },
          { optionText: "204 No Content", isCorrect: false },
          { optionText: "301 Moved Permanently", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "data-science",
    quizTitle: "Python Programming & Data Basics",
    description: "Core Python fundamentals: data types, lists, dictionaries, and Pandas concepts.",
    timeLimit: 10,
    questions: [
      {
        questionText: "Which Python data structure is immutable (values cannot be modified after creation)?",
        options: [
          { optionText: "tuple", isCorrect: true },
          { optionText: "list", isCorrect: false },
          { optionText: "dict", isCorrect: false },
          { optionText: "set", isCorrect: false },
        ],
      },
      {
        questionText: "What is the output of len({'a': 1, 'b': 2, 'c': 3}) in Python?",
        options: [
          { optionText: "3", isCorrect: true },
          { optionText: "6", isCorrect: false },
          { optionText: "2", isCorrect: false },
          { optionText: "TypeError", isCorrect: false },
        ],
      },
      {
        questionText: "In the Pandas library, what is a 2-dimensional labeled tabular data structure called?",
        options: [
          { optionText: "DataFrame", isCorrect: true },
          { optionText: "Series", isCorrect: false },
          { optionText: "Panel", isCorrect: false },
          { optionText: "Tensor", isCorrect: false },
        ],
      },
      {
        questionText: "Which keyword is used to create a function in Python?",
        options: [
          { optionText: "def", isCorrect: true },
          { optionText: "function", isCorrect: false },
          { optionText: "func", isCorrect: false },
          { optionText: "define", isCorrect: false },
        ],
      },
      {
        questionText: "What does the expression [x * 2 for x in range(3)] produce?",
        options: [
          { optionText: "[0, 2, 4]", isCorrect: true },
          { optionText: "[2, 4, 6]", isCorrect: false },
          { optionText: "[0, 1, 2]", isCorrect: false },
          { optionText: "[1, 2, 3]", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "database-systems",
    quizTitle: "SQL & Relational Databases 101",
    description: "Relational database concepts: primary keys, foreign keys, SELECT queries, and joins.",
    timeLimit: 10,
    questions: [
      {
        questionText: "Which SQL clause is used to filter records based on a specified condition?",
        options: [
          { optionText: "WHERE", isCorrect: true },
          { optionText: "ORDER BY", isCorrect: false },
          { optionText: "GROUP BY", isCorrect: false },
          { optionText: "SELECT", isCorrect: false },
        ],
      },
      {
        questionText: "What constraint uniquely identifies each record in a relational database table?",
        options: [
          { optionText: "PRIMARY KEY", isCorrect: true },
          { optionText: "FOREIGN KEY", isCorrect: false },
          { optionText: "CHECK", isCorrect: false },
          { optionText: "INDEX", isCorrect: false },
        ],
      },
      {
        questionText: "Which SQL JOIN returns all rows from the left table and matched rows from the right table?",
        options: [
          { optionText: "LEFT JOIN", isCorrect: true },
          { optionText: "INNER JOIN", isCorrect: false },
          { optionText: "RIGHT JOIN", isCorrect: false },
          { optionText: "CROSS JOIN", isCorrect: false },
        ],
      },
      {
        questionText: "In MongoDB (NoSQL), records are stored as BSON documents inside what container?",
        options: [
          { optionText: "Collections", isCorrect: true },
          { optionText: "Tables", isCorrect: false },
          { optionText: "Schemas", isCorrect: false },
          { optionText: "Rows", isCorrect: false },
        ],
      },
      {
        questionText: "What does the ACID acronym stand for in database transaction management?",
        options: [
          { optionText: "Atomicity, Consistency, Isolation, Durability", isCorrect: true },
          { optionText: "Authentication, Confidentiality, Integrity, Decryption", isCorrect: false },
          { optionText: "Access, Control, Information, Data", isCorrect: false },
          { optionText: "Array, Column, Index, Diagram", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "dsa",
    quizTitle: "Data Structures & Complexity Essentials",
    description: "Array indexing, Big-O complexity, stacks, queues, and search algorithms.",
    timeLimit: 10,
    questions: [
      {
        questionText: "What is the worst-case time complexity of accessing an element in an array by its index?",
        options: [
          { optionText: "O(1)", isCorrect: true },
          { optionText: "O(n)", isCorrect: false },
          { optionText: "O(log n)", isCorrect: false },
          { optionText: "O(n^2)", isCorrect: false },
        ],
      },
      {
        questionText: "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
        options: [
          { optionText: "Stack", isCorrect: true },
          { optionText: "Queue", isCorrect: false },
          { optionText: "Linked List", isCorrect: false },
          { optionText: "Binary Heap", isCorrect: false },
        ],
      },
      {
        questionText: "What is the time complexity of searching an element in a sorted array using Binary Search?",
        options: [
          { optionText: "O(log n)", isCorrect: true },
          { optionText: "O(n)", isCorrect: false },
          { optionText: "O(1)", isCorrect: false },
          { optionText: "O(n log n)", isCorrect: false },
        ],
      },
      {
        questionText: "Which data structure operates on a First-In, First-Out (FIFO) principle?",
        options: [
          { optionText: "Queue", isCorrect: true },
          { optionText: "Stack", isCorrect: false },
          { optionText: "Tree", isCorrect: false },
          { optionText: "Graph", isCorrect: false },
        ],
      },
      {
        questionText: "What is the average time complexity of Merge Sort?",
        options: [
          { optionText: "O(n log n)", isCorrect: true },
          { optionText: "O(n^2)", isCorrect: false },
          { optionText: "O(n)", isCorrect: false },
          { optionText: "O(log n)", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "artificial-intelligence",
    quizTitle: "Artificial Intelligence & ML Fundamentals",
    description: "Supervised learning, neural network layers, LLMs, and prompt engineering.",
    timeLimit: 10,
    questions: [
      {
        questionText: "In Machine Learning, training a model on labeled input-output pairs is called what?",
        options: [
          { optionText: "Supervised Learning", isCorrect: true },
          { optionText: "Unsupervised Learning", isCorrect: false },
          { optionText: "Reinforcement Learning", isCorrect: false },
          { optionText: "Self-Supervised Learning", isCorrect: false },
        ],
      },
      {
        questionText: "What does LLM stand for in modern AI architectures?",
        options: [
          { optionText: "Large Language Model", isCorrect: true },
          { optionText: "Low Latency Machine", isCorrect: false },
          { optionText: "Linear Logic Model", isCorrect: false },
          { optionText: "Layered Learning Matrix", isCorrect: false },
        ],
      },
      {
        questionText: "Which non-linear function is commonly used as an activation function in artificial neural networks?",
        options: [
          { optionText: "ReLU (Rectified Linear Unit)", isCorrect: true },
          { optionText: "Binary Search", isCorrect: false },
          { optionText: "Euclidean Distance", isCorrect: false },
          { optionText: "Dot Product", isCorrect: false },
        ],
      },
      {
        questionText: "What term describes an AI model generating convincing but completely false or fabricated information?",
        options: [
          { optionText: "Hallucination", isCorrect: true },
          { optionText: "Overfitting", isCorrect: false },
          { optionText: "Underfitting", isCorrect: false },
          { optionText: "Gradient Explosion", isCorrect: false },
        ],
      },
      {
        questionText: "What technique improves an LLM's response by providing a few input-output examples inside the prompt?",
        options: [
          { optionText: "Few-shot Prompting", isCorrect: true },
          { optionText: "Zero-shot Prompting", isCorrect: false },
          { optionText: "Backpropagation", isCorrect: false },
          { optionText: "Quantization", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "cyber-security",
    quizTitle: "Cyber Security & Web Defense Essentials",
    description: "Web vulnerabilities, OWASP Top 10, encryption basics, and authentication security.",
    timeLimit: 10,
    questions: [
      {
        questionText: "Which web vulnerability occurs when an attacker executes malicious JavaScript in a victim's browser?",
        options: [
          { optionText: "Cross-Site Scripting (XSS)", isCorrect: true },
          { optionText: "SQL Injection (SQLi)", isCorrect: false },
          { optionText: "Cross-Site Request Forgery (CSRF)", isCorrect: false },
          { optionText: "Denial of Service (DoS)", isCorrect: false },
        ],
      },
      {
        questionText: "Why should passwords never be stored in plain text or using reversible two-way encryption?",
        options: [
          { optionText: "They should be hashed with a cryptographic salt (e.g. bcrypt) to prevent dictionary and rainbow table attacks", isCorrect: true },
          { optionText: "Plain text passwords increase database storage costs significantly", isCorrect: false },
          { optionText: "Browsers reject plain text authentication forms automatically", isCorrect: false },
          { optionText: "Plain text passwords slow down the server login response time", isCorrect: false },
        ],
      },
      {
        questionText: "What protocol provides encrypted communication over computer networks using TLS/SSL certificates?",
        options: [
          { optionText: "HTTPS", isCorrect: true },
          { optionText: "HTTP", isCorrect: false },
          { optionText: "FTP", isCorrect: false },
          { optionText: "Telnet", isCorrect: false },
        ],
      },
      {
        questionText: "What are the three parts of a JSON Web Token (JWT)?",
        options: [
          { optionText: "Header, Payload, Signature", isCorrect: true },
          { optionText: "Username, Password, Salt", isCorrect: false },
          { optionText: "Key, IV, Ciphertext", isCorrect: false },
          { optionText: "Origin, Host, Cookie", isCorrect: false },
        ],
      },
      {
        questionText: "What primary mechanism prevents unauthorized Cross-Origin HTTP requests between different web domains?",
        options: [
          { optionText: "CORS (Cross-Origin Resource Sharing)", isCorrect: true },
          { optionText: "DNS (Domain Name System)", isCorrect: false },
          { optionText: "DHCP", isCorrect: false },
          { optionText: "SSH", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "cloud-computing",
    quizTitle: "Cloud Computing & Docker Essentials",
    description: "Cloud deployment models, Docker containers vs virtual machines, and CI/CD basics.",
    timeLimit: 10,
    questions: [
      {
        questionText: "How does a Docker container differ primarily from a traditional Virtual Machine (VM)?",
        options: [
          { optionText: "Containers share the host OS kernel and are lightweight, while VMs run full guest operating systems", isCorrect: true },
          { optionText: "Containers require dedicated hardware servers, while VMs run inside cloud browsers", isCorrect: false },
          { optionText: "VMs are faster to start up than containers", isCorrect: false },
          { optionText: "Containers do not support networking or environment variables", isCorrect: false },
        ],
      },
      {
        questionText: "What is the standard configuration file used to build a custom Docker container image?",
        options: [
          { optionText: "Dockerfile", isCorrect: true },
          { optionText: "package.json", isCorrect: false },
          { optionText: "docker-compose.yaml", isCorrect: false },
          { optionText: "Makefile", isCorrect: false },
        ],
      },
      {
        questionText: "What cloud service model allows developers to deploy code without managing servers (Serverless)?",
        options: [
          { optionText: "FaaS (Function as a Service)", isCorrect: true },
          { optionText: "IaaS (Infrastructure as a Service)", isCorrect: false },
          { optionText: "SaaS (Software as a Service)", isCorrect: false },
          { optionText: "Colocation", isCorrect: false },
        ],
      },
      {
        questionText: "What does CI/CD stand for in modern DevOps practice?",
        options: [
          { optionText: "Continuous Integration / Continuous Deployment", isCorrect: true },
          { optionText: "Cloud Infrastructure / Cloud Distribution", isCorrect: false },
          { optionText: "Container Inspection / Code Debugging", isCorrect: false },
          { optionText: "Core Interface / Computer Data", isCorrect: false },
        ],
      },
      {
        questionText: "Which AWS service provides resizable, scalable virtual computing instances in the cloud?",
        options: [
          { optionText: "Amazon EC2", isCorrect: true },
          { optionText: "Amazon S3", isCorrect: false },
          { optionText: "Amazon RDS", isCorrect: false },
          { optionText: "AWS Lambda", isCorrect: false },
        ],
      },
    ],
  },
  {
    slug: "mobile-apps",
    quizTitle: "Mobile App Development Starter",
    description: "Cross-platform development principles, React Native, and mobile UX basics.",
    timeLimit: 10,
    questions: [
      {
        questionText: "In React Native, which component replaces the standard HTML '<div>' element for layout containers?",
        options: [
          { optionText: "<View>", isCorrect: true },
          { optionText: "<Container>", isCorrect: false },
          { optionText: "<Box>", isCorrect: false },
          { optionText: "<Section>", isCorrect: false },
        ],
      },
      {
        questionText: "In React Native, which component replaces the standard HTML '<p>' or '<span>' element for rendering text?",
        options: [
          { optionText: "<Text>", isCorrect: true },
          { optionText: "<Paragraph>", isCorrect: false },
          { optionText: "<Label>", isCorrect: false },
          { optionText: "<Typography>", isCorrect: false },
        ],
      },
      {
        questionText: "What framework developed by Google uses the Dart language to build compiled cross-platform mobile apps?",
        options: [
          { optionText: "Flutter", isCorrect: true },
          { optionText: "React Native", isCorrect: false },
          { optionText: "Ionic", isCorrect: false },
          { optionText: "Cordova", isCorrect: false },
        ],
      },
      {
        questionText: "What layout engine is used by default in React Native to arrange elements on screen?",
        options: [
          { optionText: "Flexbox", isCorrect: true },
          { optionText: "CSS Grid", isCorrect: false },
          { optionText: "Float layout", isCorrect: false },
          { optionText: "Table layout", isCorrect: false },
        ],
      },
      {
        questionText: "Why must mobile applications request runtime permissions for camera, location, or microphone?",
        options: [
          { optionText: "To protect user privacy and security by giving users explicit control over sensitive device sensors", isCorrect: true },
          { optionText: "To increase app download speeds from the App Store", isCorrect: false },
          { optionText: "To decrease battery usage of the device screen", isCorrect: false },
          { optionText: "Permissions are required by CSS compilers", isCorrect: false },
        ],
      },
    ],
  },
];

async function seedTopicQuizzes() {
  try {
    console.log("Connecting to MongoDB for V3 Topic Quizzes Seed...");
    await mongoose.connect(MONGO_URI);

    // 1. Find or create instructor user
    let instructor = await User.findOne({ role: { $in: ["instructor", "admin"] } });
    if (!instructor) {
      console.log("Creating default instructor for quiz ownership...");
      instructor = await User.create({
        name: "Quimora Faculty",
        email: "instructor@quimora.edu",
        username: "faculty_head",
        password: "password123",
        role: "instructor",
        active: true,
      });
    }

    console.log(`Using Instructor ID: ${instructor._id} (${instructor.name})`);

    let createdQuizzesCount = 0;
    let createdQuestionsCount = 0;

    for (const item of TOPIC_QUIZZES) {
      const interest = await Interest.findOne({ slug: item.slug });
      if (!interest) {
        console.warn(`Interest slug "${item.slug}" not found, skipping.`);
        continue;
      }

      // Check if quiz already exists
      let quiz = await Quiz.findOne({ title: item.quizTitle });
      if (!quiz) {
        quiz = new Quiz({
          title: item.quizTitle,
          description: item.description,
          timeLimit: item.timeLimit,
          passingScore: 50,
          negativeMarking: 25,
          maxAttempts: 5,
          status: "published",
          isActive: true,
          createdBy: instructor._id,
          interestIds: [interest._id],
          tags: interest.topicTags,
        });
        await quiz.save();
        createdQuizzesCount++;
      } else {
        quiz.interestIds = [interest._id];
        quiz.tags = interest.topicTags;
        quiz.status = "published";
        quiz.isActive = true;
        await quiz.save();
      }

      // Assign quiz to instructor 1:1
      await QuizAssignment.findOneAndUpdate(
        { quizId: quiz._id },
        { instructorId: instructor._id, role: "primary", assignedAt: new Date() },
        { upsert: true, new: true }
      );

      // Create or update questions
      const questionIds = [];
      for (const qData of item.questions) {
        let question = await Question.findOne({
          quizId: quiz._id,
          questionText: qData.questionText,
        });

        if (!question) {
          question = await Question.create({
            quizId: quiz._id,
            questionText: qData.questionText,
            options: qData.options,
            marks: 2,
            difficulty: "easy",
            eloRating: 950,
          });
          createdQuestionsCount++;
        }
        questionIds.push(question._id);
      }

      quiz.questions = questionIds;
      await quiz.save();
      console.log(`✅ Seeded quiz for "${interest.name}" with ${questionIds.length} questions.`);
    }

    console.log(`\n🎉 All V3 Topic Quizzes Seeded!`);
    console.log(`Quizzes Processed: ${TOPIC_QUIZZES.length}`);
    console.log(`New Questions Created: ${createdQuestionsCount}`);
  } catch (error) {
    console.error("❌ Error seeding V3 topic quizzes:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedTopicQuizzes();
