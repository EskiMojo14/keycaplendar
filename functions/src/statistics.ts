import * as functions from "firebase-functions";

import { SetType, StatisticsSortType } from "./util/types";

type CreateStatisticsData = {
  sets: SetType[];
  sort: StatisticsSortType;
};

export const createStatistics = functions.https.onCall((data: CreateStatisticsData, context) => {
  const summaryData = {};
  const timelinesData = {};
  const statusData = {};
  const shippedData = {};
  const durationData = {};
  const vendorsData = {};
  return {
    summaryData: summaryData,
    timelinesData: timelinesData,
    statusData: statusData,
    shippedData: shippedData,
    durationData: durationData,
    vendorsData: vendorsData,
  };
});
