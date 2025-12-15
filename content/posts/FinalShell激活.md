---
title: FinalShell激活
date: 2024-08-02 00:00:00
tags:
  - 破解
---

友情提示
1、此方去仅用于学习、测试

2、请购买正版

```plaintext
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Security;
import java.util.Scanner;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class FinalShellUtil {
    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public static void main(String[] args) {
        Scanner inputScanner = new Scanner(System.in);
        System.out.print("输入机器码: ");
        String machineCode = inputScanner.nextLine();
        inputScanner.close();

        System.out.println("版本号 < 3.9.6 (旧版)");
        try {
            MessageDigest md5Digest = MessageDigest.getInstance("MD5");
            List<String> legacyVersions = Arrays.asList("61305" + machineCode + "8552", "2356" + machineCode + "13593");
            legacyVersions.stream()
                    .map(version -> md5Digest.digest(version.getBytes(StandardCharsets.UTF_8)))
                    .map(FinalShellUtil::convertToHex)
                    .map(hex -> hex.substring(8, 24))
                    .forEach(hex -> System.out.println("版本: " + hex));
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }

        System.out.println("版本号 >= 3.9.6 (新版)");
        try {
            MessageDigest keccak384Digest = MessageDigest.getInstance("Keccak-384");
            List<String> newVersions = Arrays.asList(machineCode + "hSf(78cvVlS5E", machineCode + "FF3Go(*Xvbb5s2");
            newVersions.stream()
                    .map(version -> keccak384Digest.digest(version.getBytes(StandardCharsets.UTF_8)))
                    .map(FinalShellUtil::convertToHex)
                    .map(hex -> hex.substring(12, 28))
                    .forEach(hex -> System.out.println("版本: " + hex));
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    private static String convertToHex(byte[] byteArray) {
        return IntStream.range(0, byteArray.length)
                .mapToObj(i -> String.format("%02x", byteArray[i]))
                .collect(Collectors.joining());
    }
}
```