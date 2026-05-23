import sys

def check_flag(s):
    magic = [83,112,97,114,107,123,55,104,51,95,115,110,52,107,51,95,105,115,95,51,52,115,121,95,114,105,103,104,55,63,125]
    if len(s) != len(magic):
        return False
    for i in range(len(s)):
        if ord(s[i]) != magic[i]:
            return False
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./easy_snake <your_flag>")
        sys.exit(1)
    
    flag = sys.argv[1]
    if check_flag(flag):
        print("Correct! You got the flag!")
    else:
        print("Wrong flag, try harder :)")
