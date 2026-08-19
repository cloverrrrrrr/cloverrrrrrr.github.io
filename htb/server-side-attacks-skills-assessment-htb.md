# Server-side Attacks Skills Assessment — HTB

### **Introduction**

hello everyone in this write up I will walk you through the skill assessment on server-side attacks module in htb.

### Identification

first thing first we need to find an injection point for testing our payload, while analyzing the request in this website I found some interesting requests that points to an api called truckapi.htb that this api used for called truck location and there’s an id of the identification to point, let’s test it.

Press enter or click to view image in full size

[![](https://camo.githubusercontent.com/1ff64043fbcfb46f4ad75971578e5b8b18db5301a019a850b0af72e246038021/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a584b63585938724e7734424f6b475678475f784566512e706e67)](https://camo.githubusercontent.com/1ff64043fbcfb46f4ad75971578e5b8b18db5301a019a850b0af72e246038021/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3737302f312a584b63585938724e7734424f6b475678475f784566512e706e67)

since we found the the endpoint we’ll try test a basic ssti to see the respose and confirmed the vulnerability, I use the basic payload \{{77\}} and as we can see the response returned is 49 which means the input is vulnerable to ssti is either use the Jinja2 or Twig but since the wappalyzer confirmed it uses Apache we can confirm it use Twig.

[![](https://camo.githubusercontent.com/72dff387621952ad2f985cd73ef2fbe46a6d2b89ba18a6246b87d2bf312ff178/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3535342f312a65414e38317334644e5175516f656b7848634b4b78512e706e67)](https://camo.githubusercontent.com/72dff387621952ad2f985cd73ef2fbe46a6d2b89ba18a6246b87d2bf312ff178/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3535342f312a65414e38317334644e5175516f656b7848634b4b78512e706e67)

After we can confirmed that they used Twig we can just test for the RCE to see the response before we can find the flag I used the payload from the PayloadAllTheThings and tested the command here I use the id and as expected it reflected the id of the systems.

[![](https://camo.githubusercontent.com/b0bb75bb30df2ccdc1c758632f6c0dc85a6088cea180745565b317e9f34c4cc9/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3535312f312a6e51354c4f6b69424f42306e646445584948554647672e706e67)](https://camo.githubusercontent.com/b0bb75bb30df2ccdc1c758632f6c0dc85a6088cea180745565b317e9f34c4cc9/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3535312f312a6e51354c4f6b69424f42306e646445584948554647672e706e67)

Now we can confirm the vulnerability and we can use it to retrieve the flag

[![](https://camo.githubusercontent.com/4cb93ea1b53cef8db534e674b33665bf401ccd7bc60e195b4f72fcc22f3310be/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3535312f312a365961524f6b39616f6a6330656a304456384f4955412e706e67)](https://camo.githubusercontent.com/4cb93ea1b53cef8db534e674b33665bf401ccd7bc60e195b4f72fcc22f3310be/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a3535312f312a365961524f6b39616f6a6330656a304456384f4955412e706e67)
