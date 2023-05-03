// Copyright (c) 2019 SafetyCulture Pty Ltd. All Rights Reserved.

import React, {Component} from 'react';
import ReactJson from 'react-json-view';
import {connect} from 'react-redux';
import * as errorDetails from 'grpc-web-error-details';
import './NetworkDetails.css';

class NetworkDetails extends Component {
  render() {
    const {entry} = this.props;
    return (
      <div className="widget vbox details-data">
        {this._renderContent(entry)}
      </div>
    );
  }

  _renderContent = (entry) => {
    if (entry) {
      const {clipboardIsEnabled} = this.props;
      const {method, request, response, error, rawError} = entry;
      const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'twilight' : 'rjv-default';
      var src = {method};
      if (request) src.request = request;
      if (response) src.response = response;
      if (error) src.error = error;

      try {
        const [status, details] = errorDetails.statusFromError(rawError);
        if (status && details) {
          for (const [i, detail] of details.entries()) {
            src.errorDetails = [];
            if (detail instanceof errorDetails.BadRequest) {
              let br = {
                type: "BadRequest",
                fieldViolations: [],
              };
              for (const [index, violation] of detail.getFieldViolationsList().entries()) {
                br.fieldViolations.push({
                  field: violation.getField(),
                  description: violation.getDescription(),
                });
              }
              src.errorDetails.push(br);
            }
          }
        }
      } catch (ex) {
        console.error("grpc-web: ", ex);
      }
      return (
        <ReactJson
          name="grpc"
          theme={theme}
          style={{backgroundColor: 'transparent'}}
          enableClipboard={clipboardIsEnabled}
          src={src}
        />
      )
    }
  }
}

const mapStateToProps = state => ({
  entry: state.network.selectedEntry,
  clipboardIsEnabled: state.clipboard.clipboardIsEnabled
});
export default connect(mapStateToProps)(NetworkDetails);
