/* Code developed by Muhammad Moonum Azmi for Assignment 1 */ 
//Begin set up for Express as well as supabase 
const express = require('express'); 
const supa = require('@supabase/supabase-js'); 
const app = express(); 

//error template, used in all api gets below
const jsonMessage = (msg => { 
    return { message : msg}; 
}); 

//load supabase DB
const supaUrl = 'https://fdqopsgzbskctsasuuel.supabase.co'; 
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcW9wc2d6YnNrY3RzYXN1dWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyNTA2ODMsImV4cCI6MjAyNDgyNjY4M30.doSeGB6VWpWopzjCDs1S5EZuHJK3ObmzGoDHF6mRmNY'; 

const supabase = supa.createClient(supaUrl, supaAnonKey); 

//api for retrieving seasons 
app.get('/api/seasons', async (req, res) => { 
    const {data, error} = await supabase
    .from('seasons')
    .select(); 
    if (data.length)
    res.send(data); 
}); 

//api route to return all circuits 
app.get('/api/circuits', async (req, res) => { 
    const {data, error} = await supabase
        .from('circuits')
        .select();
    res.send(data); 
}); 

//api route to return just a specific circuit 
app.get('/api/circuits/:ref', async (req, res) => { 
    const {data, error} = await supabase
        .from('circuits')
        .select()
        .eq('circuitRef', req.params.ref)
        //handle error in case of incorrect circuit ref provided 
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: No circuits were found that matched ${req.params.ref}`));
            return; 
        }
        res.send(data); 
});

//api route for circuits based on a specific year
app.get('/api/circuits/season/:year', async (req, res) => { 
    const {data, error} = await supabase
        .from('races')
        .select(`
            circuits (*), year
        `)
        .eq('year', req.params.year)
        .order('round', {ascending: true})
        //handle error in case the provided year is an invalid value 
        if (error || data.length == 0) 
        { 
            res.json(jsonMessage(`ERROR: No circuits are currently available under ${req.params.year}`));
            return; 
        };
    res.send(data); 
});

//api route for constructors 
app.get('/api/constructors', async (req, res) => { 
    const {data, error} = await supabase
        .from('constructors')
        .select();
    res.send(data); 
}); 

//api route for a specific constructor 
app.get('/api/constructors/:ref', async (req, res) => { 
    const {data, error} = await supabase
        .from('constructors')
        .select()
        .eq('constructorRef', req.params.ref)
        // handle error in case requested constructor or provided constructor reference value is incorrect 
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: No constructors are currently available under ${req.params.ref}`));
            return; 
        }; 
    res.send(data); 
}); 

//api for all drivers 
app.get('/api/drivers', async (req, res) => { 
    const {data, error} = await supabase
        .from('drivers')
        .select();
    res.send(data); 
}); 

//api for one specific driver 
app.get('/api/drivers/:ref', async (req, res) => { 
    const {data, error} = await supabase
        .from('drivers')
        .select()
        .eq('driverRef', req.params.ref)
        //handle error in case ref is an incorrect or non-existing value 
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: No drivers are currently named or referenced under ${req.params.ref}`));
            return; 
        }; 
    res.send(data); 
}); 

//api route for a driver with a requested name 
app.get('/api/drivers/search/:substring', async (req, res) => { 
    const {data, error} = await supabase
        .from('drivers')
        .select()
        .ilike('surname', `%${req.params.substring}%`)
        //handle error in the case of a non-matching substring
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: Search has found no names containing the substring ${req.params.substring}`));
            return; 
        };
    res.send(data); 
}); 

//api route that returns drivers within a given race 
app.get('/api/drivers/race/:raceId', async (req, res) => { 
    const {data, error} = await supabase 
        .from('driverStandings')
        .select(`
            drivers (*), races (name, raceId)
        `)
        .eq('raceId', req.params.raceId)
        //handle error in case raceID is provided an incorrect or non-existing value
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided race ID "${req.params.raceId}" is invalid. Try again`));
            return; 
        };
    res.send(data); 
});

//api route that returns just the specified race with circuit details  
app.get('/api/races/:raceId', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select(`
            raceId, name, circuits (name, location, country)
        `)
        .eq('raceId', req.params.raceId) 
        //handle error in case raceID is provided an incorrect or non-existing value
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided race ID "${req.params.raceId}" is invalid. Try again`)); 
            return;
        };
    res.send(data); 
});

//api route that returns races within a given season 
//ordered by rounds
app.get('/api/races/season/:year', async (req, res) => { 
    const {data, error} = await supabase
        .from('races')
        .select(`
        raceId, year, round, name, date, time, url
        `)
        .eq('year', req.params.year)
        .order('round', {ascending: false}) 
        //handle error in the case the provided year is an incorrect value 
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided year "${req.params.year}" is invalid. Try again`)); 
            return;
        };
    res.send(data); 
});

//api route that returns a specific race within a given season based on a specific round 
app.get('/api/races/season/:year/:round', async (req, res) => { 
    const {data, error} = await supabase
        .from('races')
        .select(`
        raceId, year, round, name, date, time, url
        `)
        .eq('year', req.params.year)
        .eq('round', req.params.round)
        //handle error in the case the provided year or round data is an incorrect value 
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided year "${req.params.year}" or round "${req.params.round}" is invalid. Try again`)); 
            return;
        };
    res.send(data); 
});

//api route that returns all races for a given circuit 
app.get('/api/races/circuits/:ref', async (req, res) => { 
    const {data, error} = await supabase
        .from('circuits')
        .select(`
        races (name, date, year)
        `)
        .eq('circuitRef', req.params.ref)
        .order('year', {referencedTable: 'races', ascending: true})
        //handle error in the case the provided circuit reference is invalid
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided circuit reference "${req.params.ref}" is invalid. Try again`)); 
            return; 
        }; 
    res.send(data); 
});

//api route that will return all races for a given circuit between specified years
app.get('/api/races/circuits/:ref/season/:start/:end', async (req, res) => { 
    const {data, error} = await supabase
        .from('circuits')
        .select(`
        races (name, date, year)
        `)
        .eq('circuitRef', req.params.ref)
        .gte('races.year', req.params.start)
        .lte('races.year', req.params.end)
        .order('year', {referencedTable: 'races', ascending: true})
        //check if provided start value is greater than provided end value
        //also will check for errors and incorrect values being put in 
        if (parseInt(req.params.start) > parseInt(req.params.end)) { 
            res.json(jsonMessage(`ERROR: The start value "${req.params.start}" is larger than "${req.params.end}". Try again`)); 
            return;
        } 
        else if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: One of the provided values is incorrect and invalid. Try again`)); 
            return;
        }; 
    res.send(data); 
});

//api route that prints results for a specified race, and a specialized output 
//should be sorted by field "Grid"
app.get('/api/results/:raceId', async (req, res) => { 
    const {data, error} = await supabase
    .from('results')
    .select(`
    drivers (driverRef, code, forename, surname), races (name, round, year, date), 
    constructors (name, constructorRef, nationality), grid
    `)
    .eq('raceId', req.params.raceId)
    .order('grid', {ascending: true})
    //handle error in case raceID is provided an incorrect or non-existing value
    if (error || data.length == 0) { 
        res.json(jsonMessage(`ERROR: The provided race ID "${req.params.raceId}" is invalid. Try again`)); 
        return;
    };
    res.send(data); 
});

//api route that returns all the results of a requested driver 
app.get('/api/results/driver/:ref', async (req, res) => { 
    const {data, error} = await supabase
        .from('results')
        .select(`
        *, drivers!inner (driverRef)
        `)
        .eq('drivers.driverRef', req.params.ref); 
        //handle error in case ref is an incorrect or non-existing value 
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: No drivers are currently named or referenced under ${req.params.ref}`));
            return; 
        }; 
    res.send(data); 
});

//api route that returns a record of the results of a given driver in between a start and end year 
app.get('/api/results/driver/:ref/seasons/:start/:end', async (req, res) => { 
    const {data, error} = await supabase
        .from('results')
        .select(`
        *, races!inner (year), drivers!inner (driverRef) 
        `)
        .gte('races.year', req.params.start)
        .lte('races.year', req.params.end)
        .eq('drivers.driverRef', req.params.ref); 
        //check if provided start value is greater than provided end value
        //also will check for errors and incorrect values being put in on all of the user requested values  
        if (parseInt(req.params.start) > parseInt(req.params.end)) { 
            res.json(jsonMessage(`ERROR: The start value "${req.params.start}" is larger than "${req.params.end}". Try again`)); 
            return;
        } 
        else if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: One of the provided values is incorrect and invalid. Try again`)); 
            return;
        }; 
    res.send(data); 
});

//api route that returns the qualifying results for a user provided race
//designed to ouput results and be sorted on position 
app.get('/api/qualifying/:raceId', async (req, res) => { 
    const {data, error} = await supabase
        .from('qualifying')
        .select(`
        *, drivers (driverRef, code, forename, surname), races (name, round, year, date), 
        constructors (name, constructorRef, nationality) 
        `)
        .eq('raceId', req.params.raceId)
        .order('position', {ascending: true})
         //handle error in case raceID is provided an incorrect or non-existing value
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided race ID "${req.params.raceId}" is invalid. Try again`)); 
            return;
        };
    res.send(data); 
});

//api route that will output onto the browser the current season driver standings table 
//drivers and races will be outputted according to user inputted race ID 
app.get('/api/standings/:raceId/drivers', async (req, res) => { 
    const {data, error} = await supabase
        .from('driverStandings')
        .select(`
            *, races (year), drivers (driverRef, forename, surname) 
        `)
        .eq('raceId', req.params.raceId)
        .order('position', {ascending: true})
        //handle error in case raceID is provided an incorrect or non-existing value
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided race ID "${req.params.raceId}" is invalid. Try again`)); 
            return;
        };
    res.send(data); 
});

//api route that will output onto the browser the current constructors standings  
app.get('/api/standings/:raceId/constructors', async (req, res) => { 
    const {data, error} = await supabase
        .from('constructorStandings')
        .select(`
            *, races (year), drivers (driverRef, forename, surname) 
        `)
        .eq('raceId', req.params.raceId)
        .order('position', {ascending: true})
        //handle error in case raceID is provided an incorrect or non-existing value
        if (error || data.length == 0) { 
            res.json(jsonMessage(`ERROR: The provided race ID "${req.params.raceId}" is invalid. Try again`)); 
            return;
        };
    res.send(data);
});

//listens to port, identifies it as port 3000
//originally having problems, saw a bit about port 3000 having some compatibility with this socket instead of the old one 
app.listen(3000, () => { 
    console.log('listening on port 3000'); 
}); 