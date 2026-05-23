import java.util.Scanner;

public class XorChallenge {
    private static final byte[] KEY = {
        0x62, 0x65, 0x63, 0x65, 0x6d, 0x36, 0x39
    };
    private static final byte[] ENCRYPTED = {
        0x31, 0x15, 0x02, 0x17, 0x06, 0x4d, 0x4c,
        0x3d, 0x12, 0x0a, 0x09, 0x01, 0x69, 0x57,
        0x51, 0x13, 0x50, 0x17, 0x32, 0x51, 0x4c,
        0x51, 0x16, 0x10, 0x18
    };
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("do your best loser");
        System.out.print("Enter flag: ");
        String input = scanner.nextLine();
        
        String realFlag = xorDecrypt(ENCRYPTED, KEY);
        
        if (input.equals(realFlag)) {
            System.out.println("Congrats! You got it: " + realFlag);
        } else {
            System.out.println("i told you that you are a loser");
        }
        
        scanner.close();
    }
    
    private static String xorDecrypt(byte[] data, byte[] key) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < data.length; i++) {
            result.append((char) (data[i] ^ key[i % key.length]));
        }
        return result.toString();
    }
}
