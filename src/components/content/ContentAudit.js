import React from "react";
import moment from "moment";
import firebase from "../firebase";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { AuditEntry } from "../admin/audit_log/AuditEntry";
import { ContentEmpty } from "../content/ContentEmpty";
import "./ContentAudit.scss";

export class ContentAudit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      actionsFiltered: [],
      loading: false,
      filterLength: 50,
    };
  }
  getActions = (num = this.state.filterLength) => {
    this.setState({ loading: true, filterLength: num });
    const db = firebase.firestore();
    db.collection("changelog")
      .orderBy("timestamp", "desc")
      .limit(parseInt(num))
      .get()
      .then((querySnapshot) => {
        let actions = [];
        let users = [{ label: "All", value: "all" }];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.action = data.before ? (data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data);
          if (users.filter((e) => e.value === data.user.nickname).length === 0) {
            users.push({ label: data.user.nickname, value: data.user.nickname });
          }
        });

        actions.sort(function (a, b) {
          var x = a.timestamp.toLowerCase();
          var y = b.timestamp.toLowerCase();
          if (x < y) {
            return 1;
          }
          if (x > y) {
            return -1;
          }
          return 0;
        });
        this.setState({
          actions: actions,
        });

        //this.filterActions(actions);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        this.setState({ loading: false });
      });
  };
  componentDidMount() {
    this.getActions(50);
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
    ];
    return (
      <div>
        {this.state.actions.length > 0 || this.state.loading ? (
          <div className="log-container">
            <Card
              className={"log" + (this.state.actions.length === 0 && this.state.loading ? " placeholder" : "")}
            >
              <List twoLine className="three-line">
                {this.state.actions.map((action, index) => {
                  const timestamp = moment.utc(action.timestamp);
                  return (
                    <AuditEntry
                      key={index}
                      action={action}
                      timestamp={timestamp}
                      openDeleteDialog={this.openDeleteDialog}
                      properties={properties}
                    />
                  );
                })}
              </List>
            </Card>
          </div>
        ) : (
          <ContentEmpty />
        )}
      </div>
    );
  }
}
export default ContentAudit;
