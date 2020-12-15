import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { queueTypes, actionTypes } from "../../util/propTypeTemplates";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { AuditEntry } from "../admin/audit_log/AuditEntry";
import "./ContentAudit.scss";

export class ContentAudit extends React.Component {
  componentDidMount() {
    this.props.getActions();
  }
  render() {
    const properties = [
      "profile",
      "colorway",
      "designer",
      "icDate",
      "details",
      "gbMonth",
      "gbLaunch",
      "gbEnd",
      "image",
      "shipped",
      "vendors",
      "sales",
    ];
    return (
      <div className="admin-main">
        <div className="log-container">
          <Card className={"log" + (this.props.actions.length === 0 ? " placeholder" : "")}>
            <List twoLine className="three-line">
              {this.props.actions.map((action) => {
                const timestamp = moment(action.timestamp);
                return (
                  <AuditEntry
                    key={action.timestamp}
                    action={action}
                    timestamp={timestamp}
                    openDeleteDialog={this.props.openDeleteDialog}
                    properties={properties}
                  />
                );
              })}
            </List>
          </Card>
        </div>
      </div>
    );
  }
}
export default ContentAudit;

ContentAudit.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape(actionTypes)),
  getActions: PropTypes.func,
  loading: PropTypes.bool,
  openDeleteDialog: PropTypes.func,
  snackbarQueue: PropTypes.shape(queueTypes),
};
