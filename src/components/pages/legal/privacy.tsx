import { Card } from "@rmwc/card";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Link } from "react-router-dom";
import "./legal.scss";

export const PrivacyPolicy = () => {
  return (
    <>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection>
            <Link to="/">
              <TopAppBarNavigationIcon icon="arrow_back" />
            </Link>
            <TopAppBarTitle>Privacy Policy</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust />
      <div className="legal-container">
        <Card className="legal">
          <Typography use="body2" tag="p">
            Your privacy is important to us. It is KeycapLendar&apos;s policy to respect your privacy and comply with
            any applicable law and regulation regarding any personal information we may collect about you, including
            across our website,{" "}
            <a href="https://keycaplendar.firebaseapp.com/">https://keycaplendar.firebaseapp.com/</a>, and other sites
            we own and operate.
          </Typography>
          <Typography use="body2" tag="p">
            This policy is effective as of 13 April 2021 and was last updated on 13 April 2021.
          </Typography>
          <Typography use="headline5">Information We Collect</Typography>
          <Typography use="body2" tag="p">
            Information we collect includes both information you knowingly and actively provide us when using or
            participating in any of our services and promotions, and any information automatically sent by your devices
            in the course of accessing our products and services.
          </Typography>
          <Typography use="headline5">Log Data</Typography>
          <Typography use="body2" tag="p">
            When you visit our website, our servers may automatically log the standard data provided by your web
            browser. It may include your device’s Internet Protocol (IP) address, your browser type and version, the
            pages you visit, the time and date of your visit, the time spent on each page, other details about your
            visit, and technical details that occur in conjunction with any errors you may encounter.
          </Typography>
          <Typography use="body2" tag="p">
            Please be aware that while this information may not be personally identifying by itself, it may be possible
            to combine it with other data to personally identify individual persons.
          </Typography>
          <Typography use="headline5">Personal Information</Typography>
          <Typography use="body2" tag="p">
            We may ask for personal information which may include one or more of the following:
          </Typography>
          <ul>
            <Typography use="body2" tag="li">
              Name
            </Typography>
            <Typography use="body2" tag="li">
              Email
            </Typography>
            <Typography use="body2" tag="li">
              Account avatar
            </Typography>
          </ul>
          <Typography use="headline5">Legitimate Reasons for Processing Your Personal Information</Typography>
          <Typography use="body2" tag="p">
            We only collect and use your personal information when we have a legitimate reason for doing so. In which
            instance, we only collect personal information that is reasonably necessary to provide our services to you.
          </Typography>
          <Typography use="headline5">Collection and Use of Information</Typography>
          <Typography use="body2" tag="p">
            We may collect personal information from you when you do any of the following on our website:
          </Typography>
          <ul>
            <Typography use="body2" tag="li">
              Use a mobile device or web browser to access our content
            </Typography>
            <Typography use="body2" tag="li">
              Contact us via email, social media, or on any similar technologies
            </Typography>
          </ul>
          <Typography use="body2" tag="p">
            We may collect, hold, use, and disclose information for the following purposes, and personal information
            will not be further processed in a manner that is incompatible with these purposes:
          </Typography>
          <ul>
            <Typography use="body2" tag="li">
              to enable you to customise or personalise your experience of our website
            </Typography>
          </ul>
          <Typography use="body2" tag="p">
            Please be aware that we may combine information we collect about you with general information or research
            data we receive from other trusted sources.
          </Typography>
          <Typography use="headline5">Security of Your Personal Information</Typography>
          <Typography use="body2" tag="p">
            When we collect and process personal information, and while we retain this information, we will protect it
            within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure,
            copying, use, or modification.
          </Typography>
          <Typography use="body2" tag="p">
            Although we will do our best to protect the personal information you provide to us, we advise that no method
            of electronic transmission or storage is 100% secure, and no one can guarantee absolute data security. We
            will comply with laws applicable to us in respect of any data breach.
          </Typography>
          <Typography use="body2" tag="p">
            You are responsible for selecting any password and its overall security strength, ensuring the security of
            your own information within the bounds of our services.
          </Typography>
          <Typography use="headline5">How Long We Keep Your Personal Information</Typography>
          <Typography use="body2" tag="p">
            We keep your personal information only for as long as we need to. This time period may depend on what we are
            using your information for, in accordance with this privacy policy. If your personal information is no
            longer required, we will delete it or make it anonymous by removing all details that identify you.
          </Typography>
          <Typography use="body2" tag="p">
            However, if necessary, we may retain your personal information for our compliance with a legal, accounting,
            or reporting obligation or for archiving purposes in the public interest, scientific, or historical research
            purposes or statistical purposes.
          </Typography>
          <Typography use="headline5">Children’s Privacy</Typography>
          <Typography use="body2" tag="p">
            We do not aim any of our products or services directly at children under the age of 13, and we do not
            knowingly collect personal information about children under 13.
          </Typography>
          <Typography use="headline5">Disclosure of Personal Information to Third Parties</Typography>
          <Typography use="body2" tag="p">
            We may disclose personal information to:
          </Typography>
          <ul>
            <Typography use="body2" tag="li">
              a parent, subsidiary, or affiliate of our company
            </Typography>
            <Typography use="body2" tag="li">
              third party service providers for the purpose of enabling them to provide their services, for example, IT
              service providers, data storage, hosting and server providers, advertisers, or analytics platforms
            </Typography>
            <Typography use="body2" tag="li">
              our employees, contractors, and/or related entities
            </Typography>
            <Typography use="body2" tag="li">
              our existing or potential agents or business partners
            </Typography>
            <Typography use="body2" tag="li">
              courts, tribunals, regulatory authorities, and law enforcement officers, as required by law, in connection
              with any actual or prospective legal proceedings, or in order to establish, exercise, or defend our legal
              rights
            </Typography>
            <Typography use="body2" tag="li">
              third parties, including agents or sub-contractors, who assist us in providing information, products,
              services, or direct marketing to you
            </Typography>
            <Typography use="body2" tag="li">
              third parties to collect and process data
            </Typography>
          </ul>
          <Typography use="headline5">International Transfers of Personal Information</Typography>
          <Typography use="body2" tag="p">
            The personal information we collect is stored and/or processed where we or our partners, affiliates, and
            third-party providers maintain facilities. Please be aware that the locations to which we store, process, or
            transfer your personal information may not have the same data protection laws as the country in which you
            initially provided the information. If we transfer your personal information to third parties in other
            countries: (i) we will perform those transfers in accordance with the requirements of applicable law; and
            (ii) we will protect the transferred personal information in accordance with this privacy policy.
          </Typography>
          <Typography use="headline5">Your Rights and Controlling Your Personal Information</Typography>
          <Typography use="body2" tag="p">
            You always retain the right to withhold personal information from us, with the understanding that your
            experience of our website may be affected. We will not discriminate against you for exercising any of your
            rights over your personal information. If you do provide us with personal information you understand that we
            will collect, hold, use and disclose it in accordance with this privacy policy. You retain the right to
            request details of any personal information we hold about you.
          </Typography>
          <Typography use="body2" tag="p">
            If we receive personal information about you from a third party, we will protect it as set out in this
            privacy policy. If you are a third party providing personal information about somebody else, you represent
            and warrant that you have such person’s consent to provide the personal information to us.
          </Typography>
          <Typography use="body2" tag="p">
            If you believe that any information we hold about you is inaccurate, out of date, incomplete, irrelevant, or
            misleading, please contact us using the details provided in this privacy policy. We will take reasonable
            steps to correct any information found to be inaccurate, incomplete, misleading, or out of date.
          </Typography>
          <Typography use="body2" tag="p">
            If you believe that we have breached a relevant data protection law and wish to make a complaint, please
            contact us using the details below and provide us with full details of the alleged breach. We will promptly
            investigate your complaint and respond to you, in writing, setting out the outcome of our investigation and
            the steps we will take to deal with your complaint. You also have the right to contact a regulatory body or
            data protection authority in relation to your complaint.
          </Typography>
          <Typography use="body2" tag="p">
            You have the right to have your personal information erased at any time, and the site allows you to do this.
            You can also contact us to make sure all information is removed.
          </Typography>
          <Typography use="headline5">Use of Cookies</Typography>
          <Typography use="body2" tag="p">
            We use “cookies” to collect information about you and your activity across our site. A cookie is a small
            piece of data that our website stores on your computer, and accesses each time you visit, so we can
            understand how you use our site. This helps us serve you content based on preferences you have specified.
          </Typography>
          <Typography use="headline5">Limits of Our Policy</Typography>
          <Typography use="body2" tag="p">
            Our website may link to external sites that are not operated by us. Please be aware that we have no control
            over the content and policies of those sites, and cannot accept responsibility or liability for their
            respective privacy practices.
          </Typography>
          <Typography use="headline5">Changes to This Policy</Typography>
          <Typography use="body2" tag="p">
            At our discretion, we may change our privacy policy to reflect updates to our business processes, current
            acceptable practices, or legislative or regulatory changes. If we decide to change this privacy policy, we
            will post the changes here at the same link by which you are accessing this privacy policy.
          </Typography>
          <Typography use="body2" tag="p">
            If required by law, we will get your permission or give you the opportunity to opt in to or opt out of, as
            applicable, any new uses of your personal information.
          </Typography>
          <Typography use="headline5">Contact Us</Typography>
          <Typography use="body2" tag="p">
            For any questions or concerns regarding your privacy, you may contact us using the following details:
          </Typography>
          <Typography use="body2" tag="p">
            <a href="mailto:keycaplendar@gmail.com">keycaplendar@gmail.com</a>
          </Typography>
          <Typography use="caption" tag="p">
            <a href="https://getterms.io" title="Generate a free privacy policy">
              Privacy Policy created with GetTerms.
            </a>
          </Typography>
        </Card>
      </div>
    </>
  );
};

export default PrivacyPolicy;
