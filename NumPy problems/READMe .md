# NumPy Fundamentals: Practice Problems & Solutions

This repository contains a comprehensive collection of **NumPy** exercises and solutions covering fundamental operations, array manipulation, and mathematical computations. The problems are designed to strengthen data processing skills using Python's most powerful numerical library.

## 📚 Topics Covered

The exercises in `NumPy.ipynb` are categorized into the following core areas:

### 1. Environment & Configuration
- Retrieving NumPy version and build configuration.
- Accessing built-in documentation and help functions (e.g., `np.add`).

### 2. Array Creation & Initialization
- Creating arrays with specific values (Zeros, Ones, Fives).
- Generating sequences using `arange` (e.g., integers from 30 to 70).
- Building identity matrices and staggered (checkerboard) patterns.
- Creating 3D arrays (3x3x3) with random values.
- Constructing matrices with custom borders and diagonal values.

### 3. Logical Testing & Data Validation
- Element-wise testing for:
    - Zeros (`all`, `any`).
    - Finiteness, Infinity, and NaN (Not a Number).
    - Complex vs. Real numbers and Scalar types.
- Array comparisons within specific tolerances (`allclose`, `isclose`).

### 4. Mathematical & Statistical Operations
- Element-wise comparison (Greater, Less, Equal).
- Aggregations: Summation of all elements, row-wise sums, and column-wise sums.
- Linear Algebra: Computing the inner (dot) product of vectors.
- Sign manipulation and range-based filtering.

### 5. Matrix Manipulation & Slicing
- Reshaping arrays (e.g., 1D to 3x4 matrix).
- Iterating over multi-dimensional arrays using `nditer`.
- Advanced slicing (e.g., extracting values excluding the first and last elements).
- Calculating memory occupancy and item size.

### 6. Data Persistence (File I/O)
- Saving and loading arrays in different formats:
    - Binary files (`.npy`).
    - Text files (`.txt`).
    - Converting arrays to raw bytes for low-level storage.

## 🛠️ Requirements
To run the notebook, you need:
- Python 3.x
- NumPy (Tested on version 2.0.2)

Install the dependency via pip:
```bash
pip install numpy
