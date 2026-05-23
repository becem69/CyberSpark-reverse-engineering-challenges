import base64, json
from z3 import *
_0x1 = "W3sidiI6MTEyLCJpIjoxfSx7InYiOjEyMywiaSI6NX0seyJ2IjoxMjUsImkiOjIxfSx7InYiOjk1LCJpIjo4fSx7InYiOjk1LCJpIjoxMX0seyJ2Ijo5NSwiaSI6MTh9XQ=="
_0x2 = [0x60, 0x2F, 0x08, 0x01, 0x34, 0x08, 0x6A, 0x03,
        0x6F, 0x59, 0x43, 0x00, 0x40, 0x6A, 0x4D, 0x63,
        0x40, 0x51, 0x2D, 0x58, 0x21, 0x27]
_0x3 = [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,0,1,2,3,4,5,6]
_0x4 = {
    "a": 0xDEAD ^ 0xBEEF,
    "b": (0xFF & 0x53),
    "c": 0x1337 % 0x100,
    "d": ~(-58),
}
_0x5 = base64.b64decode("W1s0OCwxNV0sWzQ4LDE2XSxbNDgsMTddLFs1MSwxOV0sWzkwLDIwXV0=").decode()
def _check(_input):
    if len(_input) != 22:
        return False
    _a = [_input[i] ^ _0x2[i] for i in range(22)]
    _b = [0] * 22
    for i in range(22):
        _b[_0x3[i]] = _a[i]
    s = Solver()
    f = [BitVec(f'_{i}', 8) for i in range(22)]
    for c in f:
        s.add(c >= 0x20, c <= 0x7e)
    for i in range(22):
        s.add(f[i] == _b[i])
    s.add(f[0]  == _0x4["b"])
    s.add(f[1]  == _0x4["b"] + 29)
    s.add(f[2]  == _0x4["b"] + 14)
    s.add(f[3]  == _0x4["b"] + 31)
    s.add(f[4]  == _0x4["b"] + 24)
    s.add(f[5]  == 123)
    s.add(f[21] == 125)
    s.add(f[6]  == f[0] + 7)
    s.add(f[7]  * 2 == 102)
    s.add(f[7]  + f[8] == 146)
    s.add(f[7]  ^ f[8] == 108)
    s.add(f[9]  == f[7] * 2 + 3)
    s.add(f[10] == f[9] + 10)
    s.add(f[12] == f[10])
    s.add(f[13] * 3 == 144)
    s.add(f[14] == f[13])
    _tbl1 = json.loads(base64.b64decode(_0x1).decode())
    for entry in _tbl1:
        s.add(f[entry["i"]] == entry["v"])
    _tbl = json.loads(_0x5)
    for entry in _tbl:
        idx, val = entry[1], entry[0]
        s.add(f[idx] == val)
    s.add(f[0] + f[0] == f[0] * 2)
    s.add(f[5] ^ 0 == f[5])
    s.add(Or(f[3] > 0, f[3] <= 0))
    return s.check() == sat
if __name__ == "__main__":
    flag = input("Enter flag: ").encode()
    if _check(flag):
        print("Correct!")
    else:
        print("Wrong!")
