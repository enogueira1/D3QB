from flask import Flask, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Initialize Flask app
app = Flask(__name__)

# Configure your database connection here
DATABASE_URI = 'your_database_connection_string'
db = create_engine(DATABASE_URI)

# --------------------------- //
#       D3 QB VIZ API         //
# --------------------------- //
@app.route('/QBD3/<player_id>')
def get_qbd3_data(player_id):
    try:
        with db.connect() as connection:
            query = """
                    SELECT 
                        season, season_type, week, pass_location, pass_length, air_yards, wpa, defteam,
                        yards_after_catch, "desc", qb_epa, pass_touchdown, interception, qtr  
                    FROM 
                        pbp_data
                    WHERE 
                        passer_player_id = :player_id AND
                        pass_location IS NOT NULL
                    ORDER BY season DESC, week DESC
                    """
            result = connection.execute(text(query), {'player_id': player_id})

            data_dicts = [{'season': row[0],
                           'season_type': row[1],
                           'week': row[2],
                           'pass_location': row[3],
                           'pass_length': row[4],
                           'air_yards': row[5],
                           'wpa': row[6],
                           'defteam': row[7],
                           'yards_after_catch': row[8],
                           'desc': row[9],
                           'qb_epa': row[10],
                           'pass_touchdown': row[11],
                           'interception': row[12],
                           'qtr': row[13]}
                          for row in result.fetchall()]

            return jsonify(data_dicts)
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
