/**
 * High-fidelity, academically accurate question bank for Python & Data Science domain.
 * Strictly verified Python, NumPy, and Pandas specifications.
 * Each quiz contains exactly 10 questions with real, detailed explanations.
 */

export const PYTHON_DATA_SCIENCE_QUESTION_REGISTRY = {
  // =========================================================================
  // COURSE 1: PYTHON FOUNDATIONS & APPLIED PROGRAMMING
  // =========================================================================

  // Chapter 1
  "Python Variables, Numeric Types & Conditional Logic": [
    {
      questionText: "In Python 3, what is the output type of the floor division expression `7 // 2`?",
      options: [
        { optionText: "int", isCorrect: true },
        { optionText: "float", isCorrect: false },
        { optionText: "decimal", isCorrect: false },
        { optionText: "complex", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Floor division `//` between two integer operands produces an integer representing the largest integer less than or equal to the quotient."
    },
    {
      questionText: "Which statement accurately describes the mutability of Python's built-in string (`str`) data type?",
      options: [
        { optionText: "Strings are immutable; any modification creates a new string object in memory.", isCorrect: true },
        { optionText: "Strings are mutable and can be modified in place via index assignment.", isCorrect: false },
        { optionText: "Strings are mutable only when defined using triple quotes.", isCorrect: false },
        { optionText: "Strings become immutable only when passed into a function.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "In Python, strings are immutable sequences. Attempting item assignment such as `s[0] = 'a'` raises a TypeError."
    },
    {
      questionText: "What is the primary difference between the `==` operator and the `is` operator in Python?",
      options: [
        { optionText: "`==` compares equality of values, whereas `is` checks for object identity (exact memory location).", isCorrect: true },
        { optionText: "`is` compares values, whereas `==` checks object identity.", isCorrect: false },
        { optionText: "`is` is only valid for comparing boolean types.", isCorrect: false },
        { optionText: "There is no difference; `is` is syntactic sugar for `==`.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "The `==` operator invokes `__eq__` to check value equality, while `is` compares memory references (`id(a) == id(b)`)."
    },
    {
      questionText: "What does the short-circuit evaluation of `x and y` return if `x` evaluates to false?",
      options: [
        { optionText: "It returns `x` immediately without evaluating `y`.", isCorrect: true },
        { optionText: "It returns `False` as a boolean regardless of `x`'s value.", isCorrect: false },
        { optionText: "It evaluates `y` and returns `y`.", isCorrect: false },
        { optionText: "It raises a ValueError.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Python's `and` expression evaluates left-to-right; if the left operand is falsy, it immediately returns that operand."
    },
    {
      questionText: "Which variable name is invalid according to PEP 8 and Python syntax rules?",
      options: [
        { optionText: "2nd_counter", isCorrect: true },
        { optionText: "_internal_cache", isCorrect: false },
        { optionText: "total_sum_v2", isCorrect: false },
        { optionText: "MAX_BUFFER_SIZE", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Python identifiers cannot begin with a numeric digit. They must start with a letter (a-z, A-Z) or an underscore (`_`)."
    },
    {
      questionText: "What is the correct syntax for a conditional ternary expression in Python?",
      options: [
        { optionText: "value_if_true if condition else value_if_false", isCorrect: true },
        { optionText: "condition ? value_if_true : value_if_false", isCorrect: false },
        { optionText: "if condition then value_if_true else value_if_false", isCorrect: false },
        { optionText: "value_if_true unless not condition else value_if_false", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Python uses `x if condition else y` for conditional inline expressions rather than the C-style `? :` ternary operator."
    },
    {
      questionText: "Why does `0.1 + 0.2 == 0.3` evaluate to `False` in standard Python floating-point arithmetic?",
      options: [
        { optionText: "Binary floating-point representation (IEEE 754) cannot represent base-10 fractions like 0.1 exactly.", isCorrect: true },
        { optionText: "Python limits all float comparisons to 2 decimal places.", isCorrect: false },
        { optionText: "The `+` operator automatically rounds results to the nearest integer.", isCorrect: false },
        { optionText: "Python does not support arithmetic between floating-point numbers.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Like most programming languages, Python uses IEEE 754 double precision binary floats, resulting in `0.1 + 0.2 = 0.30000000000000004`."
    },
    {
      questionText: "What built-in module should be used when exact decimal representation is required for financial calculations?",
      options: [
        { optionText: "decimal", isCorrect: true },
        { optionText: "math", isCorrect: false },
        { optionText: "numeric", isCorrect: false },
        { optionText: "finance", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "The `decimal` module provides support for fast correctly-rounded decimal floating-point arithmetic suitable for monetary calculations."
    },
    {
      questionText: "How should a variable be checked for being equal to `None` idiomatically in Python?",
      options: [
        { optionText: "if x is None:", isCorrect: true },
        { optionText: "if x == None:", isCorrect: false },
        { optionText: "if x.isNone():", isCorrect: false },
        { optionText: "if None(x):", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "PEP 8 specifies that comparisons to singletons like `None` should always be done with `is` or `is not`, never the equality operators."
    },
    {
      questionText: "What occurs if an integer in Python 3 exceeds the standard 64-bit maximum value (9,223,372,036,854,775,807)?",
      options: [
        { optionText: "Python handles arbitrary-precision integers automatically, allocating memory dynamically without overflow.", isCorrect: true },
        { optionText: "An OverflowError is thrown at runtime.", isCorrect: false },
        { optionText: "It silently wraps around to negative values like in C.", isCorrect: false },
        { optionText: "It automatically casts the integer to a float.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Python 3 integers have arbitrary precision (bignum arithmetic), constrained only by the host machine's available RAM."
    }
  ],

  "Python Collections: Lists, Tuples, Dictionaries & Sets": [
    {
      questionText: "What is the average time complexity of key lookup in a Python dictionary (`dict`)?",
      options: [
        { optionText: "O(1)", isCorrect: true },
        { optionText: "O(n)", isCorrect: false },
        { optionText: "O(log n)", isCorrect: false },
        { optionText: "O(n log n)", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Python dictionaries use open-addressing hash tables with quadratic probing, delivering amortized O(1) average time complexity for lookups."
    },
    {
      questionText: "Why cannot a Python `list` be used as a key in a standard `dict`?",
      options: [
        { optionText: "Lists are mutable and do not implement `__hash__`.", isCorrect: true },
        { optionText: "Lists consume too much memory to be hashed.", isCorrect: false },
        { optionText: "Dictionary keys can only be strings or integers.", isCorrect: false },
        { optionText: "Lists have no length attribute.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Only hashable (immutable) objects with an unchanging hash value across their lifetime can serve as dictionary keys."
    },
    {
      questionText: "What does `dict.get('missing_key', 'default_val')` return when `'missing_key'` does not exist in the dictionary?",
      options: [
        { optionText: "'default_val'", isCorrect: true },
        { optionText: "KeyError", isCorrect: false },
        { optionText: "None", isCorrect: false },
        { optionText: "False", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "The `.get()` method safely returns the provided default value if the key is not present, avoiding a KeyError exception."
    },
    {
      questionText: "What is the result of the slice expression `my_list[::-1]`?",
      options: [
        { optionText: "A new reversed copy of `my_list`.", isCorrect: true },
        { optionText: "Reverses `my_list` in place without creating a copy.", isCorrect: false },
        { optionText: "Returns the last item of `my_list`.", isCorrect: false },
        { optionText: "Raises an IndexError.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "A step of `-1` in slice syntax `[start:stop:step]` steps backward through the sequence, returning a new reversed list."
    },
    {
      questionText: "What distinguishes `list.sort()` from the built-in function `sorted(list)`?",
      options: [
        { optionText: "`list.sort()` sorts the list in place and returns `None`, while `sorted()` returns a new sorted list.", isCorrect: true },
        { optionText: "`list.sort()` returns a new list, while `sorted()` sorts in place.", isCorrect: false },
        { optionText: "`list.sort()` only works on numbers; `sorted()` works on strings.", isCorrect: false },
        { optionText: "There is no difference.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`.sort()` is an in-place mutating method returning `None`. The built-in `sorted()` accepts any iterable and returns a new list."
    },
    {
      questionText: "What is the result of the set operation `{1, 2, 3} & {2, 3, 4}` in Python?",
      options: [
        { optionText: "{2, 3}", isCorrect: true },
        { optionText: "{1, 4}", isCorrect: false },
        { optionText: "{1, 2, 3, 4}", isCorrect: false },
        { optionText: "set()", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "The `&` operator computes the set intersection, returning a new set with elements common to both sets."
    },
    {
      questionText: "What will `first, *middle, last = [10, 20, 30, 40, 50]` assign to `middle`?",
      options: [
        { optionText: "[20, 30, 40]", isCorrect: true },
        { optionText: "30", isCorrect: false },
        { optionText: "(20, 30, 40)", isCorrect: false },
        { optionText: "[10, 50]", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Extended iterable unpacking with `*` captures all remaining intermediate items as a new list `[20, 30, 40]`."
    },
    {
      questionText: "What is the primary operational difference between a `shallow copy` (`list.copy()`) and a `deep copy` (`copy.deepcopy()`)?",
      options: [
        { optionText: "A shallow copy duplicates the container but inserts references to nested objects; deep copy recursively duplicates nested objects.", isCorrect: true },
        { optionText: "A shallow copy only copies strings; deep copy copies numbers.", isCorrect: false },
        { optionText: "A deep copy modifies the original list.", isCorrect: false },
        { optionText: "A shallow copy is immutable, whereas a deep copy is mutable.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Shallow copying constructs a new collection and populates it with references to child items. Deep copy recursively copies all child objects."
    },
    {
      questionText: "What is the symmetric difference operator for sets in Python?",
      options: [
        { optionText: "^", isCorrect: true },
        { optionText: "-", isCorrect: false },
        { optionText: "|", isCorrect: false },
        { optionText: "%", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "The `^` operator calculates the symmetric difference, returning elements present in either set but not in both."
    },
    {
      questionText: "Which collection type preserves insertion order while allowing duplicate items and random O(1) indexed access?",
      options: [
        { optionText: "list", isCorrect: true },
        { optionText: "set", isCorrect: false },
        { optionText: "frozenset", isCorrect: false },
        { optionText: "dict_keys", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Python lists are dynamically-sized arrays maintaining ordered elements with O(1) random index access and allowing duplicates."
    }
  ],

  "Comprehensions, Lambda Functions & Generator Expressions": [
    {
      questionText: "What is the fundamental difference in memory allocation between a list comprehension and a generator expression?",
      options: [
        { optionText: "List comprehensions allocate memory for the entire list at once, while generators produce items lazily on demand.", isCorrect: true },
        { optionText: "Generators load all elements into the CPU cache; list comprehensions use swap disk.", isCorrect: false },
        { optionText: "List comprehensions are lazy; generator expressions are eager.", isCorrect: false },
        { optionText: "There is no difference in memory footprint.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "A generator expression `(x for x in ...)` computes values on-the-fly via iteration, maintaining constant O(1) memory overhead."
    },
    {
      questionText: "Which keyword turns a standard Python function into a generator function that yields a sequence of values?",
      options: [
        { optionText: "yield", isCorrect: true },
        { optionText: "return", isCorrect: false },
        { optionText: "emit", isCorrect: false },
        { optionText: "generate", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "The presence of `yield` causes the compiler to flag the function as a generator, preserving its execution frame between calls."
    },
    {
      questionText: "What exception is raised when calling `next()` on an exhausted generator iterator?",
      options: [
        { optionText: "StopIteration", isCorrect: true },
        { optionText: "IndexError", isCorrect: false },
        { optionText: "GeneratorExit", isCorrect: false },
        { optionText: "EndOfStreamError", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "The Python iterator protocol signals completion by raising `StopIteration`, which `for` loops catch transparently."
    },
    {
      questionText: "What is the syntax for `yield from` in Python generator delegation?",
      options: [
        { optionText: "yield from subgenerator()", isCorrect: true },
        { optionText: "yield all from subgenerator()", isCorrect: false },
        { optionText: "yield subgenerator().all()", isCorrect: false },
        { optionText: "return from subgenerator()", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`yield from` delegates iteration directly to a sub-generator or iterable, forwarding values and bidirectional `.send()` calls."
    },
    {
      questionText: "What restriction applies to Python's `lambda` expressions?",
      options: [
        { optionText: "They are limited to a single logical expression and cannot contain multi-line statements like `while` or assignments.", isCorrect: true },
        { optionText: "They cannot accept more than two arguments.", isCorrect: false },
        { optionText: "They cannot return boolean values.", isCorrect: false },
        { optionText: "They cannot be assigned to variables.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Python lambdas are restricted to single-expression syntax `lambda args: expression`, returning the result implicitly."
    },
    {
      questionText: "What is the output of `{x: x**2 for x in [1, 2, 3]}`?",
      options: [
        { optionText: "{1: 1, 2: 4, 3: 9}", isCorrect: true },
        { optionText: "[1, 4, 9]", isCorrect: false },
        { optionText: "{(1, 1), (2, 4), (3, 9)}", isCorrect: false },
        { optionText: "{1, 4, 9}", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Dictionary comprehension syntax `{key_expr: value_expr for item in iterable}` constructs a dictionary mapping each number to its square."
    },
    {
      questionText: "What does the `filter()` function return in Python 3?",
      options: [
        { optionText: "An iterator (filter object) that yields items lazily.", isCorrect: true },
        { optionText: "A fully instantiated list of matched items.", isCorrect: false },
        { optionText: "A dictionary with boolean keys.", isCorrect: false },
        { optionText: "A generator object with a custom close hook.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "In Python 3, `filter(fn, iterable)` returns a lazy iterator rather than building a full list, conserving memory."
    },
    {
      questionText: "What happens when `itertools.islice()` is used on an infinite generator?",
      options: [
        { optionText: "It yields elements up to the specified stop index without exhausting memory or entering an infinite loop.", isCorrect: true },
        { optionText: "It crashes because infinite generators cannot be sliced.", isCorrect: false },
        { optionText: "It converts the generator into a tuple.", isCorrect: false },
        { optionText: "It raises a TypeError.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`itertools.islice()` pulls only the requested slice range from any iterator lazily, making it safe for infinite streams."
    },
    {
      questionText: "What does `zip([1, 2], ['a', 'b', 'c'])` do with the unmatched item `'c'`?",
      options: [
        { optionText: "It stops at the shortest input iterable, discarding `'c'` unless `zip_longest()` is used.", isCorrect: true },
        { optionText: "It raises a ValueError for unequal lengths.", isCorrect: false },
        { optionText: "It pairs `'c'` with `None` automatically.", isCorrect: false },
        { optionText: "It wraps around and pairs `'c'` with `1`.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Standard `zip()` truncates to the length of the shortest iterable. To pad with `None`, use `itertools.zip_longest()`."
    },
    {
      questionText: "How can a generator's current execution be halted and its resources cleaned up from the outside?",
      options: [
        { optionText: "By calling `gen.close()`, which raises `GeneratorExit` inside the generator frame.", isCorrect: true },
        { optionText: "By calling `del gen`.", isCorrect: false },
        { optionText: "By calling `gen.terminate()`.", isCorrect: false },
        { optionText: "By raising KeyboardInterrupt.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Calling `.close()` raises `GeneratorExit` at the point of the active `yield`, executing any surrounding `finally` blocks."
    }
  ],

  // =========================================================================
  // COURSE 2: DATA ANALYSIS WITH NUMPY & PANDAS
  // =========================================================================

  "NumPy ndarray Creation, Array Shapes, Data Types & Indexing": [
    {
      questionText: "What is the primary architectural advantage of a NumPy `ndarray` over a Python `list` for numerical computations?",
      options: [
        { optionText: "Contiguous block of homogeneous memory in C, enabling CPU cache efficiency and SIMD vectorization.", isCorrect: true },
        { optionText: "NumPy arrays allow storing mixed data types without memory overhead.", isCorrect: false },
        { optionText: "NumPy arrays are stored on disk instead of RAM.", isCorrect: false },
        { optionText: "NumPy arrays automatically run code on GPUs without setup.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "NumPy stores data in contiguous memory buffers with uniform datatypes (`dtype`), allowing fast C-level execution and vectorization."
    },
    {
      questionText: "What does the `ndarray.ndim` attribute return?",
      options: [
        { optionText: "The number of array dimensions (axes).", isCorrect: true },
        { optionText: "The total number of elements in the array.", isCorrect: false },
        { optionText: "The byte size of each element.", isCorrect: false },
        { optionText: "The memory layout format (C vs Fortran).", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "`.ndim` represents the number of axes (dimensions) of the array, e.g. 1 for a vector, 2 for a matrix."
    },
    {
      questionText: "What is the difference between `np.arange(0, 10, 2)` and `np.linspace(0, 10, 5)`?",
      options: [
        { optionText: "`np.arange` takes a step size, while `np.linspace` takes the desired number of evenly spaced samples.", isCorrect: true },
        { optionText: "`np.linspace` only returns integer arrays.", isCorrect: false },
        { optionText: "`np.arange` is inclusive of the stop value; `np.linspace` is exclusive.", isCorrect: false },
        { optionText: "There is no difference.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "`np.arange(start, stop, step)` generates values by step size, whereas `np.linspace(start, stop, num)` generates `num` evenly spaced points."
    },
    {
      questionText: "What happens when you pass a list with mixed types like `[1, 2, 3.5]` to `np.array()`?",
      options: [
        { optionText: "NumPy upcasts all elements to the common floating-point type (`float64`).", isCorrect: true },
        { optionText: "NumPy throws a TypeError because arrays must be uniform.", isCorrect: false },
        { optionText: "NumPy truncates `3.5` to integer `3`.", isCorrect: false },
        { optionText: "NumPy creates an array of object references.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "NumPy automatically upcasts data types to maintain homogeneity; mixing integers and floats produces an array of floats."
    },
    {
      questionText: "How do you access the element at row 2, column 3 in a 2D NumPy array `arr` idiomatically?",
      options: [
        { optionText: "arr[2, 3]", isCorrect: true },
        { optionText: "arr.get(2, 3)", isCorrect: false },
        { optionText: "arr[2][3][0]", isCorrect: false },
        { optionText: "arr(2, 3)", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "NumPy uses tuple-based multi-axis indexing `arr[row, col]`, which avoids creating an intermediate row slice object."
    },
    {
      questionText: "What does `arr.reshape(2, -1)` do if `arr` contains 8 elements total?",
      options: [
        { optionText: "It infers the remaining dimension automatically as 4, producing a (2, 4) array.", isCorrect: true },
        { optionText: "It raises a ValueError because `-1` is not a valid dimension.", isCorrect: false },
        { optionText: "It deletes the remaining elements.", isCorrect: false },
        { optionText: "It produces a (2, 1) array.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "Passing `-1` in `reshape()` instructs NumPy to calculate the exact dimension size automatically based on total element count."
    },
    {
      questionText: "What method changes the data type of an existing NumPy array explicitly?",
      options: [
        { optionText: "arr.astype()", isCorrect: true },
        { optionText: "arr.cast()", isCorrect: false },
        { optionText: "arr.to_type()", isCorrect: false },
        { optionText: "arr.convert()", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "`.astype(np.float32)` creates a copy of the array cast to the specified data type."
    },
    {
      questionText: "What does `np.eye(4)` generate?",
      options: [
        { optionText: "A 4x4 2D identity matrix with ones on the main diagonal and zeros elsewhere.", isCorrect: true },
        { optionText: "An array of 4 random numbers.", isCorrect: false },
        { optionText: "A 4-element 1D array filled with ones.", isCorrect: false },
        { optionText: "A 4x4 matrix filled with random values.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "`np.eye(N)` generates an N x N identity matrix with 1.0 along the main diagonal and 0.0 everywhere else."
    },
    {
      questionText: "What does `arr.flatten()` return compared to `arr.ravel()`?",
      options: [
        { optionText: "`flatten()` always returns a copy; `ravel()` returns a view whenever possible.", isCorrect: true },
        { optionText: "`ravel()` always returns a copy; `flatten()` returns a view.", isCorrect: false },
        { optionText: "`flatten()` only works on 3D arrays.", isCorrect: false },
        { optionText: "There is no difference.", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "`.flatten()` allocates and returns a new flattened 1D array copy. `.ravel()` returns a contiguous 1D view without copying memory if possible."
    },
    {
      questionText: "What attribute reveals the total memory size of an array in bytes?",
      options: [
        { optionText: "arr.nbytes", isCorrect: true },
        { optionText: "arr.itemsize", isCorrect: false },
        { optionText: "arr.size", isCorrect: false },
        { optionText: "arr.memory()", isCorrect: false }
      ],
      marks: 2, difficulty: "easy",
      explanation: "`arr.nbytes` returns the total number of bytes consumed by the array's elements (`arr.size * arr.itemsize`)."
    }
  ],

  "Pandas Series, DataFrame Creation & CSV Ingestion": [
    {
      questionText: "What is the structural difference between a Pandas `Series` and a `DataFrame`?",
      options: [
        { optionText: "A Series is a 1D labeled array; a DataFrame is a 2D tabular structure with labeled rows and columns.", isCorrect: true },
        { optionText: "A Series can hold multiple datatypes per column; a DataFrame cannot.", isCorrect: false },
        { optionText: "A DataFrame is 1D; a Series is 2D.", isCorrect: false },
        { optionText: "Series are immutable; DataFrames are mutable.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "A Series represents a single column of data with an index. A DataFrame is a 2-dimensional spreadsheet-like table composed of multiple Series."
    },
    {
      questionText: "Which parameter in `pd.read_csv()` designates a specific column to serve as the DataFrame's row index?",
      options: [
        { optionText: "index_col", isCorrect: true },
        { optionText: "row_names", isCorrect: false },
        { optionText: "primary_key", isCorrect: false },
        { optionText: "key_col", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`index_col=0` or `index_col='id'` designates the specified column as the row labels of the resulting DataFrame."
    },
    {
      questionText: "What information does `df.info()` provide that `df.describe()` does not?",
      options: [
        { optionText: "Non-null count and explicit data types for each column, along with memory usage.", isCorrect: true },
        { optionText: "Mean, standard deviation, and quartiles.", isCorrect: false },
        { optionText: "Visual histograms of numerical distributions.", isCorrect: false },
        { optionText: "Unique string values.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`df.info()` summarizes index and column types, non-null counts, and memory footprint. `df.describe()` generates descriptive summary statistics."
    },
    {
      questionText: "How does `df['col_name']` differ from `df[['col_name']]` in terms of returned object type?",
      options: [
        { optionText: "`df['col_name']` returns a Series; `df[['col_name']]` returns a DataFrame with one column.", isCorrect: true },
        { optionText: "`df['col_name']` returns a DataFrame; `df[['col_name']]` returns a Series.", isCorrect: false },
        { optionText: "Both return a NumPy array.", isCorrect: false },
        { optionText: "Both return identical Series.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Passing a single string returns the column as a 1D Series. Passing a list of column names returns a 2D DataFrame."
    },
    {
      questionText: "What does `df.shape` return?",
      options: [
        { optionText: "A tuple (number_of_rows, number_of_columns).", isCorrect: true },
        { optionText: "The total number of cells in the table.", isCorrect: false },
        { optionText: "A list of column names.", isCorrect: false },
        { optionText: "The memory address of the table.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`df.shape` returns a tuple representing DataFrame dimensionality `(rows, columns)`."
    },
    {
      questionText: "How can you prevent Pandas from writing row index numbers into the output CSV file when calling `df.to_csv()`?",
      options: [
        { optionText: "df.to_csv('output.csv', index=False)", isCorrect: true },
        { optionText: "df.to_csv('output.csv', no_index=True)", isCorrect: false },
        { optionText: "df.to_csv('output.csv', headers_only=True)", isCorrect: false },
        { optionText: "df.drop_index().to_csv('output.csv')", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "Setting `index=False` omits the integer row index column from the saved CSV file."
    },
    {
      questionText: "What Pandas function parses a string column into standard `datetime64[ns]` timestamp objects?",
      options: [
        { optionText: "pd.to_datetime()", isCorrect: true },
        { optionText: "pd.parse_date()", isCorrect: false },
        { optionText: "df.as_date()", isCorrect: false },
        { optionText: "datetime.strptime()", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`pd.to_datetime(df['date_col'])` parses diverse string representations into optimized Pandas timestamp objects."
    },
    {
      questionText: "What does `df.head(10)` display?",
      options: [
        { optionText: "The first 10 rows of the DataFrame.", isCorrect: true },
        { optionText: "The first 10 columns of the DataFrame.", isCorrect: false },
        { optionText: "The top 10 highest values sorted descending.", isCorrect: false },
        { optionText: "The first 10 characters of every cell.", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`.head(n)` returns the first `n` rows of the caller object (defaulting to 5 if omitted)."
    },
    {
      questionText: "What attribute returns the column names of a DataFrame as an Index object?",
      options: [
        { optionText: "df.columns", isCorrect: true },
        { optionText: "df.keys()", isCorrect: false },
        { optionText: "df.headers", isCorrect: false },
        { optionText: "df.fields", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`df.columns` holds the column labels of the DataFrame as an Index array."
    },
    {
      questionText: "What parameter in `pd.read_csv()` allows reading only a specific subset of columns to save memory?",
      options: [
        { optionText: "usecols", isCorrect: true },
        { optionText: "select_columns", isCorrect: false },
        { optionText: "filter_cols", isCorrect: false },
        { optionText: "only_fields", isCorrect: false }
      ],
      marks: 5, difficulty: "medium",
      explanation: "`usecols=['colA', 'colB']` reads only the designated columns, dramatically cutting memory consumption when loading large CSV files."
    }
  ],

  "Handling Missing Data: isnull, dropna & fillna Strategies": [
    {
      questionText: "Why does `np.nan == np.nan` evaluate to `False` in Python?",
      options: [
        { optionText: "IEEE 754 standard mandates that NaN (Not a Number) does not compare equal to any value, including itself.", isCorrect: true },
        { optionText: "NumPy has a bug in its equality comparator.", isCorrect: false },
        { optionText: "NaN values have different memory addresses on every evaluation.", isCorrect: false },
        { optionText: "Python requires strings for comparison.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Under IEEE 754 floating-point standards, `NaN != NaN` is always True. Use `pd.isna()` or `np.isnan()` to detect missing values."
    },
    {
      questionText: "How do you count the total number of missing (`null`) values in each column of a DataFrame `df`?",
      options: [
        { optionText: "df.isnull().sum()", isCorrect: true },
        { optionText: "df.count_nulls()", isCorrect: false },
        { optionText: "df.dropna().count()", isCorrect: false },
        { optionText: "df.size - df.len()", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`df.isnull()` returns a boolean DataFrame; calling `.sum()` aggregates Trues (represented as 1) column-wise."
    },
    {
      questionText: "What does `df.dropna(axis=1)` do?",
      options: [
        { optionText: "Drops any column that contains at least one null value.", isCorrect: true },
        { optionText: "Drops any row that contains at least one null value.", isCorrect: false },
        { optionText: "Drops only the first column.", isCorrect: false },
        { optionText: "Replaces missing values in column 1 with zeros.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "By setting `axis=1` (or `axis='columns'`), `.dropna()` drops entire columns possessing missing values."
    },
    {
      questionText: "What is the difference between `how='any'` and `how='all'` in `df.dropna()`?",
      options: [
        { optionText: "`how='any'` drops if at least one NaN is present; `how='all'` drops only if all values in the row/column are NaN.", isCorrect: true },
        { optionText: "`how='all'` drops rows matching any condition.", isCorrect: false },
        { optionText: "`how='any'` only affects numerical columns.", isCorrect: false },
        { optionText: "There is no difference.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`how='all'` requires every entry in the axis to be null before dropping, protecting rows with partial data."
    },
    {
      questionText: "How do you fill missing numerical values in column `'salary'` with the column's mean value?",
      options: [
        { optionText: "df['salary'] = df['salary'].fillna(df['salary'].mean())", isCorrect: true },
        { optionText: "df['salary'].replace(np.nan, 'mean')", isCorrect: false },
        { optionText: "df.impute('salary', 'mean')", isCorrect: false },
        { optionText: "df['salary'].dropna(mean=True)", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`fillna()` replaces missing values with the scalar mean computed across non-null entries."
    },
    {
      questionText: "What imputation strategy does `df.bfill()` (or `method='bfill'`) perform?",
      options: [
        { optionText: "Backward fill: propagates the next valid observation backward to fill the gap.", isCorrect: true },
        { optionText: "Forward fill: propagates the previous valid observation forward.", isCorrect: false },
        { optionText: "Fills with zero.", isCorrect: false },
        { optionText: "Replaces with the average of both neighbors.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Backward fill takes the next upcoming non-null value in the sequence and copies it into previous NaN cells."
    },
    {
      questionText: "What data type does a column of integers automatically become when an `np.nan` is introduced into standard Pandas?",
      options: [
        { optionText: "float64", isCorrect: true },
        { optionText: "object", isCorrect: false },
        { optionText: "int64", isCorrect: false },
        { optionText: "string", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Because standard IEEE `np.nan` is a floating-point value, classical integer columns are coerced to `float64` unless nullable `Int64` is used."
    },
    {
      questionText: "How do you replace an arbitrary sentinel value like `-999` with `np.nan` across a DataFrame?",
      options: [
        { optionText: "df.replace(-999, np.nan)", isCorrect: true },
        { optionText: "df.fillna(-999)", isCorrect: false },
        { optionText: "df.loc[df == -999].delete()", isCorrect: false },
        { optionText: "df.where(df == -999, np.nan)", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`.replace(to_replace, value)` seamlessly replaces arbitrary error or sentinel codes with canonical `np.nan`."
    },
    {
      questionText: "What method performs linear interpolation between known points to fill missing values in time-series data?",
      options: [
        { optionText: "df.interpolate(method='linear')", isCorrect: true },
        { optionText: "df.extrapolate()", isCorrect: false },
        { optionText: "df.fillna(method='linear')", isCorrect: false },
        { optionText: "df.smooth()", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "`.interpolate()` computes values between surrounding points along the index, ideal for sequential and time-series data."
    },
    {
      questionText: "Why is blindly dropping rows with missing values (`df.dropna()`) risky in statistical analysis?",
      options: [
        { optionText: "It can introduce severe selection bias if data is Not Missing At Random (NMAR) and substantially reduce statistical sample power.", isCorrect: true },
        { optionText: "It causes memory fragmentation in Pandas.", isCorrect: false },
        { optionText: "It deletes the column index headers.", isCorrect: false },
        { optionText: "It converts remaining values to strings.", isCorrect: false }
      ],
      marks: 10, difficulty: "hard",
      explanation: "Dropping missing records when values are systematically missing skews distributions, introduces survivor bias, and shrinks sample size."
    }
  ]
};

