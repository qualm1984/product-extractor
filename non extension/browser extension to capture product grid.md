step one the user searches in google and that returns results, to get to the product grid with 8 products listed the user needs to scroll down as shown in image2.png with the red arrow until they reach the results.

then image3.png shows clicking on the first product grid result, causes a panel on the right to open up with vendors for that product, also it shows a more shops button which allows expansion of the panel to show more sellers of that product as shown in image4.png

I want the extension to extract the information that i have described above regarding product grid listings

so first product result in the grid has this selector:

#tsuid_V2hdZ-vvGbC_hbIPs9-hyAE_242 > div.uv2Bcc.BdPNpe > div > div > div > div > div.SaPmZ > div.aqszKe > div

second product has this

#tsuid_V2hdZ-vvGbC_hbIPs9-hyAE_471 > div.uv2Bcc.BdPNpe > div > div > div > div > div.SaPmZ > div.aqszKe > div

first vendor in right panel that opens for first product grid item has this selector:

#rSanR > div.iQYbye > div > div > div > div.zxYWDc.q9kVJb > div > div:nth-child(5) > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > div > div > a > div > div > div > div.EHWXMb.RLo00b > div.Ncoygd > div > div > div.hP4iBf.gUf0b.uWvFpd

second vendor for first product grid item has this selector:

#rSanR > div.iQYbye > div > div > div > div.zxYWDc.q9kVJb > div > div:nth-child(5) > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(2) > div > div > a > div > div > div > div.EHWXMb.RLo00b > div.Ncoygd > div > div > div.hP4iBf.gUf0b.uWvFpd

i also believe as google protects against crawling its results these would change:

- Base ID pattern: `tsuid_V2hdZ-vvGbC_hbIPs9-hyAE_[NUMBER]`
- Common classes: `uv2Bcc BdPNpe`, `SaPmZ`, `aqszKe` how do we create something that matches the structure rather than the exact letters and numbers