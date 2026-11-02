import importlib.util
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("materialize_scene_sources.py")
SPEC = importlib.util.spec_from_file_location("materialize_scene_sources", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


SOURCE = "var asset: Dictionary = b.finish(_materials,Base._roof_tile())"
REPLACEMENT = (
    "var asset: Dictionary = "
    "b.finish(_materials,Base._roof_tile(),Base._stone_unit_mesh())"
)


class VillageCivilStoneMultiMeshTests(unittest.TestCase):
    def write_source(self, text: str) -> tuple[tempfile.TemporaryDirectory, Path]:
        temporary = tempfile.TemporaryDirectory()
        village = Path(temporary.name)
        source = village / "presentation" / "approved_civil_buildings.gd"
        source.parent.mkdir(parents=True)
        source.write_text(text, encoding="utf-8")
        return temporary, village

    def test_exact_donor_anchor_receives_shared_stone_mesh(self):
        temporary, village = self.write_source("before\n" + SOURCE + "\nafter\n")
        self.addCleanup(temporary.cleanup)

        changed = MODULE.fix_village_civil_stone_multimesh(village)
        rewritten = (village / "presentation" / "approved_civil_buildings.gd").read_text(
            encoding="utf-8"
        )

        self.assertEqual(changed, 1)
        self.assertEqual(rewritten.count(REPLACEMENT), 1)
        self.assertNotIn(SOURCE, rewritten)

    def test_missing_anchor_fails_closed(self):
        temporary, village = self.write_source("unrelated donor source\n")
        self.addCleanup(temporary.cleanup)

        with self.assertRaises(MODULE.SourceError):
            MODULE.fix_village_civil_stone_multimesh(village)

    def test_duplicate_anchor_fails_closed_without_writing(self):
        original = SOURCE + "\n" + SOURCE + "\n"
        temporary, village = self.write_source(original)
        self.addCleanup(temporary.cleanup)

        with self.assertRaises(MODULE.SourceError):
            MODULE.fix_village_civil_stone_multimesh(village)

        source = village / "presentation" / "approved_civil_buildings.gd"
        self.assertEqual(source.read_text(encoding="utf-8"), original)

    def test_second_application_fails_closed(self):
        temporary, village = self.write_source(SOURCE + "\n")
        self.addCleanup(temporary.cleanup)
        MODULE.fix_village_civil_stone_multimesh(village)

        with self.assertRaises(MODULE.SourceError):
            MODULE.fix_village_civil_stone_multimesh(village)

    def test_playable_runtime_uses_distinct_neighbor_screen_variables(self):
        runtime_test = (
            MODULE.RUNTIME_SOURCE / "test_playable_runtime.gd"
        ).read_text(encoding="utf-8")

        self.assertEqual(runtime_test.count("var focused_neighbor_screen:"), 1)
        self.assertEqual(runtime_test.count("var frontier_screen:"), 1)


if __name__ == "__main__":
    unittest.main()
