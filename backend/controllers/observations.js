const { Observation } = require('../models');

const markObservationReviewed = async (req, res) => {
  try {
    const observation = await Observation.findByPk(req.params.id);

    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    observation.reviewed = true;
    await observation.save();

    res.json({ message: 'Observation marked as reviewed', observation_id: observation.id,reviewed: observation.reviewed});

  } catch (error) {
    console.error('Error updating observation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  markObservationReviewed
};