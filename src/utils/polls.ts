import _ from "lodash";
import { MonkeyTypes } from "../types/types";

export function mapOptions(poll: MonkeyTypes.Poll): string;
export function mapOptions(
  options: MonkeyTypes.PollOptions,
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
            isVisible ? ` | ${formatVotes(votes?.get(value)?.size ?? 0)}` : ""
          }`
      )
      .join("\n");
  } else {
    const poll = pollOrOptions;

    let index = 1;
    return poll.votes
      .map(
        (value, key) =>
          `${index++}: ${key}${
            poll.isVisible ? ` | ${formatVotes(value.size)}` : ""
          }`
      )
      .join("\n");
  }
}

function formatVotes(votes: number): string {
  return `${votes} ${votes === 1 ? "vote" : "votes"}`;
}
