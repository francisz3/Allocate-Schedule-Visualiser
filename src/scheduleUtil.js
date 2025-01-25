export function getSchedules(timeslotGroups, daysOnCampus){
    const currentCombination = [];

    // try find the days that are high priority add them to schedule
    // drop added classes from timeslotGroups
    for(const group of timeslotGroups){
        if(group.length == 1){

            // remove from timeslotGroups
            currentCombination.push(group[0]);
            timeslotGroups.splice(timeslotGroups.indexOf(group), 1);
        }
    }

    if(currentCombination.length > daysOnCampus){
        // console.log("You have classes with fixed timeslots, that prevent you from doing ", daysOnCampus, " day(s) of university");
    }

    // check if days
    const validSchedules = [];

    function generateCombination(index, currentCombination, daysOnCampus){
        
        if (index === timeslotGroups.length) {
            // If we've assigned all courses, check if it meets the requirements
                validSchedules.push(currentCombination);
            
            return;
        }
        const group = timeslotGroups[index]
        
        for(const slot of group){
            // check if the slot conflicts with any already selected slots
            const conflict = currentCombination.some((existingSlot) => existingSlot.day === slot.day && timeslotOverlap(existingSlot.time, existingSlot.duration, slot.time, slot.duration));
                        
            if(conflict) continue;


           
            generateCombination(index + 1, [...currentCombination, slot], daysOnCampus);
        }

        
    }

    generateCombination(0, currentCombination, daysOnCampus);
    return validSchedules;
}

export function timeslotOverlap(startTime1, duration1, startTime2, duration2) {
    // convert start times to minutes from midnight
    const s1Minutes = (parseInt(startTime1.substring(0,2)) * 60 )+ parseInt(startTime1.substring(3,5));
    const s2Minutes = (parseInt(startTime2.substring(0,2)) * 60 )+ parseInt(startTime2.substring(3,5));

    // create end time by adding duration to start time
    const e1Minutes = s1Minutes + (parseInt(duration1[0]) * 60);
    const e2Minutes = s2Minutes + (parseInt(duration2[0]) * 60);

    return s1Minutes < e2Minutes && s2Minutes < e1Minutes;
}