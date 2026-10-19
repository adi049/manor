/* Small pure helpers shared by the static forms and the no-dependency logic checks. */
(function (scope) {
  "use strict";

  scope.NDMValidateOccupancy = function (adultValue, childValue, maxGuests) {
    var adultsText = adultValue == null ? "" : String(adultValue).trim();
    var childrenText = childValue == null ? "" : String(childValue).trim();
    var adults = adultsText === "" ? NaN : Number(adultsText);
    var children = childrenText === "" ? 0 : Number(childrenText);
    var maximum = Number.isInteger(Number(maxGuests)) && Number(maxGuests) > 0 ? Number(maxGuests) : 3;

    if (!Number.isInteger(adults) || adults < 1) {
      return { valid: false, field: "adults", total: null, message: "Enter at least one adult as a whole number." };
    }
    if (!Number.isInteger(children) || children < 0) {
      return { valid: false, field: "children", total: null, message: "Enter the number of children as a whole number of zero or more." };
    }
    if (adults > maximum) {
      return { valid: false, field: "adults", total: adults + children, message: "A room can accommodate no more than " + maximum + " guests in total." };
    }
    if (adults + children > maximum) {
      return { valid: false, field: "occupancy", total: adults + children, message: "Adults and children together cannot exceed " + maximum + " guests per room." };
    }
    return { valid: true, field: "", total: adults + children, message: "" };
  };
})(window);
