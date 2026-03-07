class DiagnosisSupervisor:

    def select_primary(self, disease_probs):

        # sort diseases
        ranked = sorted(
            disease_probs,
            key=lambda x: x["probability"],
            reverse=True
        )

        primary = ranked[0]

        # Safety downgrade rule
        if primary["disease"] == "Dengue":
            if primary["probability"] < 0.85:
                primary["flag"] = "suspected"
            else:
                primary["flag"] = "confirmed"

        else:
            primary["flag"] = "likely"

        return primary