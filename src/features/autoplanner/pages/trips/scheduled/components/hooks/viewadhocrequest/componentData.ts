export const viewAdhocRequestRows = () => {
  const mapCustomToursToAdhocRows = (data: any[]) => {
    return data.map((item: any) => ({
      time: item.time,
      agentName: item.agent_name,
      mode: item.mode,
      refNumber: item.ref_number,
      guestName: item.guest_name,
      guestContactNumber: item.guestContactNumber,
      adultCount: item.adult_count,
      childCount: item.child_count,
      tripStatus: item.tripStatus || 'Upcoming',
      source: item.from.locationAddress,
      destination: item.to.locationAddress,
      trfOrGuide: item.trfOrGuide || null,
      driverName: item.driverName,
      vehicleNumber: item.vehicleNumber,
      driverContactNumber: item.driverContactNumber || null,
      startTimestamp: item.startTimestamp,
      tourName: item.tourName,
      journeyId: item.journey_id,
      tripID: item.trip_id,
      isAdhoc: item.isAdhoc,
      adhocAccepted: item.adhocAccepted,
      startLat: item.startLat,
      startLng: item.startLng,
      endLat: item.endLat,
      endLng: item.endLng,
      bufferTime: item.buffer_time,
      date: item.date,
      isCustomRoute: item.isCustomRoute,
      color: item.adhocAccepted ? '#a7f3d0' : '#ffffff'
    }));
  };

  return {
    mapCustomToursToAdhocRows
  };
};
