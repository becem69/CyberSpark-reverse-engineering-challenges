# 🔍 CyberSpark CTF : Reverse Engineering Track

> **Author:** becem69  
> **Repo:** [github.com/becem69/CyberSpark-reverse-engineering-challenges](https://github.com/becem69/CyberSpark-reverse-engineering-challenges.git)

---

## 📁 Repository Structure

```
.
├── build/
│   └── easy_snake/          # PyInstaller build artifacts
├── dist/
│   └── easy_snake           # Compiled PyInstaller binary
├── top_sec                  # Challenge 1 — C binary
├── unsolvable_challenge.java# Challenge 2 — Java XOR challenge
├── easy_snake.py            # Challenge 3 — PyInstaller source (packed binary in dist/)
├── Z3_obfuscation.py        # Challenge 4 — Obfuscated Z3 constraint challenge
├── Z3.py                    # Challenge 5 — Z3 constraint solving challenge
└── the_vault.js             # Challenge 6 — JavaScript logic challenge
```

---

## ⚠️ Disclaimer

> This is **not a writeup repository.** No solutions or flags are provided here.  
> The source files are shared for educational and archival purposes only.  
> Solve the challenges yourself — that's the point.

---

## 🧩 Challenges

### 1. `top_sec` : *Introduction*
| | |
|---|---|
| **Type** | C Binary |
| **Difficulty** | ⭐ Beginner |
| **Concepts** | Static analysis, string extraction |

A compiled C binary and the perfect entry point into the track. No heavy tooling required — standard Linux utilities are your best friend here. The flag is hiding in plain sight inside the binary.

**Skills tested:** Basic static analysis, familiarity with binary inspection tools.

---

### 2. `unsolvable_challenge.java` : *Java Analysis*
| | |
|---|---|
| **Type** | Java Source / Bytecode |
| **Difficulty** | ⭐⭐ Easy |
| **Concepts** | XOR encryption, Java bytecode analysis |

A Java challenge that claims to be unsolvable. Spoiler: it's not. The program encrypts a flag and compares it against user input. Understand the encryption scheme, recover the key, and the flag is yours.

**Skills tested:** Java source/bytecode reading, understanding symmetric XOR operations, key identification.

---

### 3. `easy_snake` *(dist/easy_snake)* : *Binary Unpacking*
| | |
|---|---|
| **Type** | PyInstaller Executable |
| **Difficulty** | ⭐⭐ Easy–Medium |
| **Concepts** | PyInstaller reverse engineering, Python source recovery |

Distributed as a standalone compiled binary built with PyInstaller. The challenge requires you to unpack the executable, recover the embedded Python bytecode, and reconstruct the original program logic to extract the flag.

**Skills tested:** PyInstaller unpacking, `.pyc` decompilation, Python source recovery.

---

### 4. `Z3_obfuscation.py` : *Advanced Obfuscation*
| | |
|---|---|
| **Type** | Python / SMT Solving |
| **Difficulty** | ⭐⭐⭐⭐ Hard |
| **Concepts** | Control flow obfuscation, data encoding, Z3 SMT solver |

A heavily obfuscated Python script designed to resist static analysis. Variable names are meaningless, data is encoded in multiple layers (base64, XOR, permutations), and redundant Z3 constraints are sprinkled throughout to mislead. Cutting through the noise and modeling the real constraints is the key.

**Skills tested:** Python deobfuscation, constraint analysis, Z3 theorem prover, recognizing tautologies and red herrings.

---

### 5. `Z3.py` : *Constraint Solving*
| | |
|---|---|
| **Type** | Python / SMT Solving |
| **Difficulty** | ⭐⭐⭐ Medium–Hard |
| **Concepts** | Symbolic execution, Z3 constraints, permutation reversal |

A Python challenge that runs the input through a sequence of transformations — XOR, permutation, and constraint checks — before validating it. The flag must satisfy a system of constraints. Model them correctly and Z3 will hand you the answer.

**Skills tested:** Symbolic execution, understanding XOR + permutation pipelines, Z3 BitVec constraint modeling.

---

### 6. `the_vault.js` : *Script Logic*
| | |
|---|---|
| **Type** | JavaScript |
| **Difficulty** | ⭐⭐⭐ Medium |
| **Concepts** | Bitwise operations, custom encoding, runtime logic |

A JavaScript challenge involving bitwise manipulation, custom encoding schemes, and runtime flag verification. Analysis in a browser devtools console or Node.js environment is your best starting point.

**Skills tested:** JavaScript debugging, bitwise operation analysis, client-side logic reversal.

---

## 🛠️ Recommended Tools

| Tool | Use Case |
|------|----------|
| `strings`, `file`, `xxd` | Static analysis of binaries |
| `javap` | Java bytecode disassembly |
| `pyinstxtractor` + `pycdc` / `decompile3` | PyInstaller unpacking & `.pyc` decompilation |
| Python + `z3-solver` | SMT constraint solving |
| Browser DevTools / Node.js | JavaScript challenge analysis |
| Ghidra / IDA Free | Advanced binary disassembly |
| `binwalk` | Binary extraction |

Install Z3 Python bindings:
```bash
pip install z3-solver
```

---

## 🧠 Learning Path

If you're new to reverse engineering, the intended progression is:

```
top_sec  →  unsolvable_challenge.java  →  easy_snake  →  Z3.py  →  Z3_obfuscation.py  →  the_vault.js
```

Each challenge introduces a new layer of complexity and a new class of tools or techniques.

---

## 📜 License

These challenges are shared for educational purposes.  
Do not distribute flags or writeups publicly without permission from the author.

---

*Designed and authored by **becem69** for CyberSpark CTF.*
