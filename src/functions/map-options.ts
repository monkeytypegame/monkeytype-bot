import { MonkeyTypes } from "../types/types";
import _ from "lodash";

export function mapOptions(pollOrOptions: MonkeyTypes.Poll): string;
export function mapOptions(
  pollOrOptions: MonkeyTypes.PollOptions,
  votes: MonkeyTypes.PollVotes,
  isVisible: boolean
): string;
export function mapOptions(
  pollOrOptions: MonkeyTypes.Poll | MonkeyTypes.PollOptions,
  votes?: MonkeyTypes.PollVotes,
  isVisible?: boolean
): string {
  if (_.isArray(pollOrOptions)) {
    const options = pollOrOptions;
    return options
      .map(
        (value, index) =>
          `${index + 1}: ${value}${
            isVisible ? ` | ${votes?.get(value)?.size ?? 0} votes` : ""
          }`
      )
      .join("\n");
  } else {
    const poll = pollOrOptions;

    console.log(poll);

    let index = 1;
    return poll.votes
      .map(
        (value, key) =>
          `${index++}: ${key}${poll.isVisible ? ` | ${value.size} votes` : ""}`
      )
      .join("\n");
  }
}
