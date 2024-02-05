const vidminDays = (days) => {
    days = days.toString();
    const dlen = days.length;
    const lnum = Number(days[dlen - 1]);
    return dlen > 1 && days[dlen - 2] !== 1
      ? "днів"
      : lnum === 1
      ? "день"
      : lnum < 5 && lnum > 0
      ? "дні"
      : "днів";
  };
  const vidminHours = (hours) => {
    switch (hours) {
      case 1:
      case 21:
        return "година";
      case 2:
      case 3:
      case 4:
      case 22:
      case 23:
      case 24:
        return "години";
      default:
        return "годин";
    }
  };
  const vidminMinutes = (minutes) => {
    minutes = minutes.toString();
    const dlen = minutes.length;
    const lnum = Number(minutes[dlen - 1]);
    return dlen > 1 && minutes[dlen - 2] === 1
      ? "хвилин"
      : lnum === 1
      ? "хвилина"
      : lnum < 5 && lnum > 0
      ? "хвилини"
      : "хвилин";
  };

export const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    let days = Math.floor(hours / 24);
    hours = hours % 24;
    return (
      (days>0? days +
      " " +
      vidminDays(days) +
      " " : "" )+
      (hours>0?
      hours +
      " " +
      vidminHours(hours) +
      " " :"")+
      (minutes>0 ? minutes +
      " " +
      vidminMinutes(minutes):"Time is up.")
    );
  };
  