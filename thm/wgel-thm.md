---
description: >-
  Free Room. Anyone can deploy virtual machines in the room (without being
  subscribed)! by MrSeth6797
---

# Wgel - THM

<figure><img src="../.gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

### **Enumeration**

I started with nmap scan and as we can see that we’ve got 2 open port. On port 22 for ssh, and 80 for http.

[![](https://camo.githubusercontent.com/55c10367e394afcb5ee676c031bcefb2943bdba30834f5e2e6b33563629ce7d1/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a385f71664b79363179736136437762593137416455772e706e67)](https://camo.githubusercontent.com/55c10367e394afcb5ee676c031bcefb2943bdba30834f5e2e6b33563629ce7d1/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a385f71664b79363179736136437762593137416455772e706e67)

As we browse it reveals the Apache default page.

[![](https://camo.githubusercontent.com/74ea4c8f2dee2b3a62912d0f256c01ff796106d471cf01c5b1b9dcadc4d7efe0/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a454a786278464255697977384c6e585147344b7a78412e706e67)](https://camo.githubusercontent.com/74ea4c8f2dee2b3a62912d0f256c01ff796106d471cf01c5b1b9dcadc4d7efe0/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a454a786278464255697977384c6e585147344b7a78412e706e67)

Next we’ll enumerate the directory by using gobuster to find something in this web page.

[![](https://camo.githubusercontent.com/757d0b7b27944f8fbc53f1f9a6c779f78733ad5fad32f76d207327b1d9df993d/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a4c7475416e5237645154365f696b47764b6a573253412e706e67)](https://camo.githubusercontent.com/757d0b7b27944f8fbc53f1f9a6c779f78733ad5fad32f76d207327b1d9df993d/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a4c7475416e5237645154365f696b47764b6a573253412e706e67)

The result from gobuster we find that there’s a hidden directory in the web page called _sitemap._ After I manually browsing the page one by one I found nothing, so I decide to continue the directory enumeration in this _sitemap_ sub-directory.

[![](https://camo.githubusercontent.com/fa1e8ca159e873d4e2e11cfc064e9ff306d5a365af9f49d08f71e71050460ec7/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a6c4458677550453350386243766f444635577a2d31772e706e67)](https://camo.githubusercontent.com/fa1e8ca159e873d4e2e11cfc064e9ff306d5a365af9f49d08f71e71050460ec7/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a6c4458677550453350386243766f444635577a2d31772e706e67)

We find an interesting file here as we can see there’s a directory called **/.ssh** , let’s see what’s inside.

[![](https://camo.githubusercontent.com/bf3725b44f4b3cb891af90404eebb44f176c2b415bbc1528be180817b1c88593/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3734392f312a563872487067333373654145597377435048377575512e706e67)](https://camo.githubusercontent.com/bf3725b44f4b3cb891af90404eebb44f176c2b415bbc1528be180817b1c88593/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3734392f312a563872487067333373654145597377435048377575512e706e67)

***

### **Exploitation**

There’s a file called _id\_rsa,_ that contain an ssh key, and since we doesn’t know the username of the ssh I’ve built a script for finding the right username, before that first thing first we’ve to save the ssh key that we find.

```
#!/bin/bash  
  
# Usage: ./ssh_username_enum.sh <ip> <rsa_key> <username_list>  
  
if [ "$#" -ne 3 ]; then  
    echo "Usage: $0 <target_ip> <id_rsa_path> <username_list>"  
    exit 1  
fi  
  
IP="$1"  
KEY="$2"  
USERLIST="$3"  
  
if [ ! -f "$KEY" ]; then  
    echo "[-] RSA key not found: $KEY"  
    exit 2  
fi  
  
if [ ! -f "$USERLIST" ]; then  
    echo "[-] Username list not found: $USERLIST"  
    exit 3  
fi
```

[![](https://camo.githubusercontent.com/7298e034f54b96e363f90e9a55155ea39e1f9cfeca15c11d105f0dc4e6f15b81/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a3850714e516178765a4a35503964633737772d316f512e706e67)](https://camo.githubusercontent.com/7298e034f54b96e363f90e9a55155ea39e1f9cfeca15c11d105f0dc4e6f15b81/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a3850714e516178765a4a35503964633737772d316f512e706e67)

As we can see that we’ve found the username for the ssh, so now we can login using the ssh

[![](https://camo.githubusercontent.com/59f2c046286b6c474eaa5e3528586f9861cdcc2c8d8db14421000011a3e26f90/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a522d6a5a3854363145315f48685f51335646735037412e706e67)](https://camo.githubusercontent.com/59f2c046286b6c474eaa5e3528586f9861cdcc2c8d8db14421000011a3e26f90/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a522d6a5a3854363145315f48685f51335646735037412e706e67)

And we’re logged in into the system and now we’ll search for the flags

[![](https://camo.githubusercontent.com/102a6ced0195d5c38b3c660282ce0f8d00d2ffea7ccc4ebb473ae807b07f8fc4/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a33466e74565a616853325250364f63464b554f7758512e706e67)](https://camo.githubusercontent.com/102a6ced0195d5c38b3c660282ce0f8d00d2ffea7ccc4ebb473ae807b07f8fc4/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a33466e74565a616853325250364f63464b554f7758512e706e67)

The user\_flag.txt is located in /Documents directory

***

### **Privilege Escalation**

After we found the user flag, we are going to find the root flag to do that we have to escalate our current user to root. first we’re going to see if there’s any sudo privileges in our user.

[![](https://camo.githubusercontent.com/ebd4aeb52f616435e9f52c8f96df759c0c8edcfbef90ef1bf64ef3bcc0f927d8/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a697259716e673467514679394f442d334f625f4838512e706e67)](https://camo.githubusercontent.com/ebd4aeb52f616435e9f52c8f96df759c0c8edcfbef90ef1bf64ef3bcc0f927d8/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a697259716e673467514679394f442d334f625f4838512e706e67)

As we can see, we can use wget within the sudo privileges so we’re gonna escalate use this wget. our plan is to sent the /etc/passwd file to the host machine, we’re gonna set a listener in the host machine.

[![](https://camo.githubusercontent.com/b4216f1edb0832e11925b6930df843218dfb4e85507f92d98e0b361d83e35117/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a78476f51492d74555a36646d6f576e314c32664235512e706e67)](https://camo.githubusercontent.com/b4216f1edb0832e11925b6930df843218dfb4e85507f92d98e0b361d83e35117/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a78476f51492d74555a36646d6f576e314c32664235512e706e67)

Then we’ll sent the file using the wget since the wget is allowing us to use the sudo in our victim machine.

[![](https://camo.githubusercontent.com/45fab5ec98ff714e2d5a11d554bf3fa4bf8dd82ffdb7ddb7a178adcd6e54ccdf/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a396658636264457a76636b30756479506a475f6436672e706e67)](https://camo.githubusercontent.com/45fab5ec98ff714e2d5a11d554bf3fa4bf8dd82ffdb7ddb7a178adcd6e54ccdf/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a396658636264457a76636b30756479506a475f6436672e706e67)

Before we edit the root password first we’ve to make the password, here we used the openssl to make the password. You can make whatever password you want. Here I set the password ‘root’ for the root.

[![](https://camo.githubusercontent.com/b87c1d6892c21d4623a088383150a101894907fa274750ef133ce2fb4cd3bf9b/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a38336653626f385130714d7232514b424c78335038772e706e67)](https://camo.githubusercontent.com/b87c1d6892c21d4623a088383150a101894907fa274750ef133ce2fb4cd3bf9b/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a38336653626f385130714d7232514b424c78335038772e706e67)

After that input the password that we made earlier to the root section the format is:

root:{password that you create}:18195:0:99999:7:::

[![](https://camo.githubusercontent.com/821fe3f119361984f66095aad8d74c2f7f64f890c2fa9849cbd44af4b9d32ead/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a77686537664d686473495347332d555854454f6f49672e706e67)](https://camo.githubusercontent.com/821fe3f119361984f66095aad8d74c2f7f64f890c2fa9849cbd44af4b9d32ead/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a77686537664d686473495347332d555854454f6f49672e706e67)

Since we’ve changed the password for the root, we can save the file and send it back to the victim machine, firstly we have to set the http.server in our machine so we can download the file to victims machine using the wget.

[![](https://camo.githubusercontent.com/78779abcdf58fa427212a5f1f1f7963c5cf81fb8852d737f325e77da3d800dc9/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a344e6c7658435034546d4c5668774337496a6d3250512e706e67)](https://camo.githubusercontent.com/78779abcdf58fa427212a5f1f1f7963c5cf81fb8852d737f325e77da3d800dc9/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a344e6c7658435034546d4c5668774337496a6d3250512e706e67)

Next we can use wget to download the modified shadow file in the victim machine, and put the output file directly to **/etc/passwd**.

[![](https://camo.githubusercontent.com/3ead17e9393be1574616caa331f1394a7fbe37b44dce65b369a4aa0a09e64859/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a385432626d4e355933336a336f4f6e626c6f387a6c512e706e67)](https://camo.githubusercontent.com/3ead17e9393be1574616caa331f1394a7fbe37b44dce65b369a4aa0a09e64859/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a385432626d4e355933336a336f4f6e626c6f387a6c512e706e67)

After we put the file, we can login as root use the password that you created to login as a root user.

[![](https://camo.githubusercontent.com/4862a811e8e6348af2799ef50b136d5617b92270893dd5113c16566dd465f258/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a5055436339502d6c714b594a51654d4a5066446650672e706e67)](https://camo.githubusercontent.com/4862a811e8e6348af2799ef50b136d5617b92270893dd5113c16566dd465f258/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a5055436339502d6c714b594a51654d4a5066446650672e706e67)

As we can see the root\_flag.txt is located in the **/root** directory.
