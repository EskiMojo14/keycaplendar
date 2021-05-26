###### *Starred fields are mandatory.
# Profile*
The name of the profile, or the manufacturer in the case of Cherry profile.

###### Use the autocomplete menu to ensure that the field matches existing entries exactly.

# Colorway*
The name of the colorway.

###### This can include a suffix such as “r2” if it is a revision, using lowercase r to avoid confusion with SA R3.

# Designer*
The name of the designer (either well-known name, or forum username). If the set is a collaboration, this can include multiple designers by separating each with a comma (the site will add a space after a comma - make sure not to add an extra one).

###### Use autocomplete and own discretion to ensure that this is consistent with other entries with the same designer.

###### This field is disabled for designers.

# IC date*
The date of the first IC, in ISO 8601 format (`YYYY-MM-DD`). This ideally should be when the Geekhack/Keebtalk IC was posted, or when a Reddit thread was posted if there is no GH thread.

# Details*
The link to the IC/GB info. Geekhack is preferred, but failing that, a Reddit thread or dedicated site such as MiTo’s is acceptable.

# Notes
Any additional information to be displayed in the details drawer, such as a maximum number of kits sold.

# Image*
The thumbnail to display for the set. This should be a render of the keycap set on a board, *not by keycaprenders.com*.

You can upload from a link such as Imgur (make sure it’s `https://i.imgur.com/<code>.<png/jpg>`, not `https://imgur.com/<code>`), or you can upload from file by clicking **FROM FILE** and browsing or dragging the file in.

###### Please note that images will be resized upon upload, and will be cropped to 16:9 or 1:1 when displayed on the site. For this reason, angled renders/shots look better than straight on.

# Month/Date
If only a month for the GB is known, then enter it in the GB month field in `YYYY-MM` format (e.g. 2020-10 for October 2020).

If an exact date for the GB is known, then you can click **DATE** and enter the exact date in the fields given (in ISO 8601 format, `YYYY-MM-DD`). GB end date is not mandatory, but should be added once known.

###### It is also possible to enter a year quarter as a date (e.g. Q3 2020). The set will remain on the IC page until a month/date is given.

# Shipped
Whether the set has shipped to customers.
- [x]  Shipped
- [ ]  Not shipped

###### You don’t have to be too strict with this. As long as there are pictures of the set by customers (not the designer or vendors), it should be fine to confirm.

# Vendors
Click **ADD VENDOR** to add a vendor to the set. You can drag the vendors to reorder using the handle (top right), and delete with the delete icon.

###### Note that reordering the vendors isn't necessary often as the details drawer will automatically sort vendors alphabetically by region - it's just useful in the case of comparing to a list as you're editing.

## Fields
#### Name*
The name of the vendor.

###### Use the autocomplete suggestions to ensure that the formatting is consistent with other sets (e.g. Cannon Keys not CannonKeys).

#### Region*
The region the vendor covers.

Use the autocomplete suggestions to ensure that the naming is consistent with other sets.

###### If the vendor is covering multiple regions, separate each region with a comma. If a single vendor covers all regions, then enter “Global”. Common regions are listed below.

| Do | Don't†  |  
| - | - |
| America | US, NA, USA |
| Asia | China‡, Japan |
| Oceania | Australia |
| South East Asia | Singapore |
| Europe | United Kingdom |
| Canada | NA |

###### †Unless there are separate vendors for these regions, such as proto[Typist] and MyKeyboard on the same set.

###### ‡zFrontier is a common exception, as their site has a separate link for China. In this case, enter the Chinese link as a separate vendor, named zFrontier (CN).

#### Store link
The link to the store product.

###### This should be a direct link to the product/collection, not a link to the homepage of the store. If no specific link exists yet, leave blank.

#### End date
The end date specific to the vendor, if different to the main set end date. Enter in ISO 8601 format (`YYYY-MM-DD`).

###### Enable with the checkbox, and enter into the field that appears. The value will be cleared and the field will disappear if the checkbox is unchecked.

# Sales
#### URL
A direct link to a sales graph, usually created by dvorcol. This can be including extras or excluding extras - ideally this distinction should be clear in the image.

#### Third party graph
Whether the sales graph was made by someone other than dvorcol.

###### Setting this to true will hide the “Created by dvorcol” credit in the sales dialog.