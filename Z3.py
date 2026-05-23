import base64
from z3 import *

_0x1 = [0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01, 0x02,
        0x03, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01,
        0x02, 0x03, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03,
        0x01, 0x02, 0x03, 0x01, 0x02, 0x03]

_0x2 = [5,12,23,8,17,28,1,14,25,2,19,29,6,11,22,3,16,27,0,13,24,7,18,26,4,15,21,9,20,10]

_0x3 = base64.b64decode(
    "aDF0MXdSNXJzbX41cnFgNmxpMnExYWpiXGVvXHhg"
)

_0x4 = 0xDEAD ^ 0xBEEF
_0x5 = ~(-59)

def _check(_input):
    if len(_input) != 30:
        return False

    _a = [_input[i] ^ _0x1[i] for i in range(30)]
    _b = [0] * 30
    for i in range(30):
        _b[_0x2[i]] = _a[i]

    s = Solver()
    f = [BitVec(f'_{i}', 8) for i in range(30)]

    for i in range(30):
        s.add(f[i] == _b[i])

    for i, v in enumerate(_0x3):
        s.add(f[i] == v)

    s.add(f[0]  + f[0]  == f[0] * 2)
    s.add(f[5]  ^ 0     == f[5])
    s.add(Or(f[3] > 0,    f[3] <= 0))
    s.add(f[1]  * 1     == f[1])
    s.add(_0x4 == 0x6042)
    s.add(_0x5 == 58)

    return s.check() == sat


if __name__ == "__main__":
    flag = input("Enter flag: ").encode()
    if _check(flag):
        print("Correct!")
    else:
        print("Wrong!")
