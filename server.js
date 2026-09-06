const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// स्थिर फाईल्स (HTML/CSS) सर्व्ह करण्यासाठी
app.use(express.static(path.join(__dirname)));

// डेटा सेव्ह करण्यासाठी JSON फाईलचा वापर (Database सारखी)
const DATA_FILE = path.join(__dirname, 'challenges.json');

// जर फाईल नसेल तर रिकामी फाईल तयार करणे
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// API: समस्या स्वीकारण्याचा मार्ग (Endpoint)
app.post('/api/submit-challenge', (req, res) => {
    const newChallenge = {
        id: Date.now(),
        name: req.body.name,
        district: req.body.district,
        category: req.body.category,
        description: req.body.description,
        date: new Date().toISOString()
    };

    // जुना डेटा वाचणे आणि नवीन डेटा जोडणे
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Server Error' });
        }
        
        const challenges = JSON.parse(data);
        challenges.push(newChallenge);

        fs.writeFile(DATA_FILE, JSON.stringify(challenges, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to save data' });
            }
            res.status(200).json({ success: true, message: 'Challenge saved successfully!', data: newChallenge });
        });
    });
});

// API: सर्व समस्या पाहण्यासाठी (Admin/Dashboard साठी)
app.get('/api/challenges', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Server Error' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
