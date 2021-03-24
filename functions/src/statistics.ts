import * as functions from "firebase-functions";

import { SetType, StatisticsSortType } from "./util/types";

type CreateStatisticsData = {
  sets: SetType[];
  sort: StatisticsSortType;
};

export const createStatistics = functions.https.onCall((data: CreateStatisticsData, context) => {
  return "hi";
});
