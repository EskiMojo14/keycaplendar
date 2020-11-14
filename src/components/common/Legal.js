import React from "react";
import { Link } from "react-router-dom";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
} from "@rmwc/top-app-bar";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import "./Legal.scss";

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
      <TopAppBarFixedAdjust key="AppBarFixedAdjust" />,
      <div className="legal-container">
        <Card className="legal">
          <Typography use="body2" tag="p">
            Your privacy is important to us. It is KeycapLendar's policy to respect your privacy regarding any
            information we may collect from you across our website,{" "}
            <a href="http://keycaplendar.firebaseapp.com">http://keycaplendar.firebaseapp.com</a>, and other sites we
            own and operate.
          </Typography>
          <Typography use="body2" tag="p">
            We only ask for personal information when we truly need it to provide a service to you. We collect it by
            fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how
            it will be used.
          </Typography>
          <Typography use="body2" tag="p">
            We only retain collected information for as long as necessary to provide you with your requested service.
            What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as
            unauthorised access, disclosure, copying, use or modification.
          </Typography>
          <Typography use="body2" tag="p">
            We don’t share any personally identifying information publicly or with third-parties, except when required
            to by law.
          </Typography>
          <Typography use="body2" tag="p">
            Our website may link to external sites that are not operated by us. Please be aware that we have no control
            over the content and practices of these sites, and cannot accept responsibility or liability for their
            respective privacy policies.
          </Typography>
          <Typography use="body2" tag="p">
            You are free to refuse our request for your personal information, with the understanding that we may be
            unable to provide you with some of your desired services.
          </Typography>
          <Typography use="body2" tag="p">
            Your continued use of our website will be regarded as acceptance of our practices around privacy and
            personal information. If you have any questions about how we handle user data and personal information, feel
            free to contact us.
          </Typography>
          <Typography use="body2" tag="p">
            This policy is effective as of 28 March 2020.
          </Typography>
          <Typography use="body2" tag="p">
            <a href="https://getterms.io" title="Generate a free privacy policy">
              Privacy Policy created with GetTerms.
            </a>
          </Typography>
        </Card>
      </div>
    </>
  );
};

export const TermsOfService = () => {
  return (
    <>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection>
            <Link to="/">
              <TopAppBarNavigationIcon icon="arrow_back" />
            </Link>
            <TopAppBarTitle>KeycapLendar Terms of Service</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      ,
      <TopAppBarFixedAdjust key="AppBarFixedAdjust" />
      <div className="legal-container">
        <Card className="legal">
          <Typography use="headline5">1. Terms</Typography>
          <Typography use="body2" tag="p">
            By accessing the website at{" "}
            <a href="http://keycaplendar.firebaseapp.com">http://keycaplendar.firebaseapp.com</a>, you are agreeing to
            be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible
            for compliance with any applicable local laws. If you do not agree with any of these terms, you are
            prohibited from using or accessing this site. The materials contained in this website are protected by
            applicable copyright and trademark law.
          </Typography>
          <Typography use="headline5">2. Use Licence</Typography>
          <Typography use="body2" tag="ol" type="a">
            <Typography use="body2" tag="li">
              Permission is granted to temporarily download one copy of the materials (information or software) on
              KeycapLendar's website for personal, non-commercial transitory viewing only. This is the grant of a
              licence, not a transfer of title, and under this licence you may not:
              <Typography use="body2" tag="ol" type="i">
                <Typography use="body2" tag="li">
                  modify or copy the materials;
                </Typography>
                <Typography use="body2" tag="li">
                  use the materials for any commercial purpose, or for any public display (commercial or
                  non-commercial);
                </Typography>
                <Typography use="body2" tag="li">
                  attempt to decompile or reverse engineer any software contained on KeycapLendar's website;
                </Typography>
                <Typography use="body2" tag="li">
                  remove any copyright or other proprietary notations from the materials; or
                </Typography>
                <Typography use="body2" tag="li">
                  transfer the materials to another person or "mirror" the materials on any other server.
                </Typography>
              </Typography>
            </Typography>
            <Typography use="body2" tag="li">
              This licence shall automatically terminate if you violate any of these restrictions and may be terminated
              by KeycapLendar at any time. Upon terminating your viewing of these materials or upon the termination of
              this licence, you must destroy any downloaded materials in your possession whether in electronic or
              printed format.
            </Typography>
          </Typography>
          <Typography use="headline5">3. Disclaimer</Typography>
          <Typography use="body2" tag="ol" type="a">
            <Typography use="body2" tag="li">
              The materials on KeycapLendar's website are provided on an 'as is' basis. KeycapLendar makes no
              warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without
              limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of rights.
            </Typography>
            <Typography use="body2" tag="li">
              Further, KeycapLendar does not warrant or make any representations concerning the accuracy, likely
              results, or reliability of the use of the materials on its website or otherwise relating to such materials
              or on any sites linked to this site.
            </Typography>
          </Typography>
          <Typography use="headline5">4. Limitations</Typography>
          <Typography use="body2" tag="p">
            In no event shall KeycapLendar or its suppliers be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to
            use the materials on KeycapLendar's website, even if KeycapLendar or a KeycapLendar authorised
            representative has been notified orally or in writing of the possibility of such damage. Because some
            jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential
            or incidental damages, these limitations may not apply to you.
          </Typography>
          <Typography use="headline5">5. Accuracy of materials</Typography>
          <Typography use="body2" tag="p">
            The materials appearing on KeycapLendar's website could include technical, typographical, or photographic
            errors. KeycapLendar does not warrant that any of the materials on its website are accurate, complete or
            current. KeycapLendar may make changes to the materials contained on its website at any time without notice.
            However KeycapLendar does not make any commitment to update the materials.
          </Typography>
          <Typography use="headline5">6. Links</Typography>
          <Typography use="body2" tag="p">
            KeycapLendar has not reviewed all of the sites linked to its website and is not responsible for the contents
            of any such linked site. The inclusion of any link does not imply endorsement by KeycapLendar of the site.
            Use of any such linked website is at the user's own risk.
          </Typography>
          <Typography use="headline5">7. Modifications</Typography>
          <Typography use="body2" tag="p">
            KeycapLendar may revise these terms of service for its website at any time without notice. By using this
            website you are agreeing to be bound by the then current version of these terms of service.
          </Typography>
          <Typography use="headline5">8. Governing Law</Typography>
          <Typography use="body2" tag="p">
            These terms and conditions are governed by and construed in accordance with the laws of United Kingdom and
            you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </Typography>
          <Typography use="body2" tag="p">
            <a href="https://getterms.io" title="Generate a free terms of use document">
              Terms of Use created with GetTerms.
            </a>
          </Typography>
        </Card>
      </div>
    </>
  );
};

export default PrivacyPolicy;
